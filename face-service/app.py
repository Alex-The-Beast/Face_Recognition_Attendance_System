


#final model we ahve to integrate this only

from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import numpy as np
import cv2
import face_recognition
import os
import pickle
import uuid
import base64
import json
from datetime import datetime
import logging
from io import BytesIO
from PIL import Image
import dlib
import tensorflow as tf
from deepface import DeepFace
# from deepface.commons import functions
from sklearn.metrics.pairwise import cosine_similarity
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import base64
import numpy as np
import cv2
import face_recognition
import json
import pickle
from datetime import datetime
import tensorflow as tf
from PIL import Image
import io
import uuid
from dotenv import load_dotenv
import logging
import shutil


# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

#app = FastAPI(title="Face Recognition Attendance API", 
#              description="Advanced Face Recognition API for Attendance System",
#              version="2.0.0")

app = Flask(__name__)
CORS(app)

# Add CORS middleware
#app.add_middleware(
#    CORSMiddleware,
#    allow_origins=["*"],  # In production, replace with specific origins
#    allow_credentials=True,
#    allow_methods=["*"],
#    allow_headers=["*"],
#)

# Configuration
#DATA_DIR = os.environ.get("DATA_DIR", "face_data")
#ENCODINGS_FILE = os.path.join(DATA_DIR, "encodings.pkl")
#PROFILE_PHOTOS_DIR = os.path.join(DATA_DIR, "profile_photos")
#ATTENDANCE_PHOTOS_DIR = os.path.join(DATA_DIR, "attendance_photos")
#MODELS_DIR = os.path.join(DATA_DIR, "models")
#CONFIDENCE_THRESHOLD = 0.6
#ANTI_SPOOFING_THRESHOLD = 0.8
#MODEL_VERSION = "v2.0"

DATA_DIR = os.environ.get('DATA_DIR', 'data')
FACE_DATA_DIR = os.path.join(DATA_DIR, 'faces')
MODEL_DIR = os.path.join(DATA_DIR, 'models')
TEMP_DIR = os.path.join(DATA_DIR, 'temp')
ATTENDANCE_DIR = os.path.join(DATA_DIR, 'attendance')
PROFILE_PHOTOS_DIR = os.path.join(DATA_DIR, 'profile_photos')
ENCODINGS_FILE = os.path.join(MODEL_DIR, "encodings.pkl")
MODELS_DIR = os.path.join(DATA_DIR, "models")
CONFIDENCE_THRESHOLD = 0.6
ANTI_SPOOFING_THRESHOLD = 0.8
MODEL_VERSION = "v2.0"

# Create necessary directories
#os.makedirs(DATA_DIR, exist_ok=True)
#os.makedirs(PROFILE_PHOTOS_DIR, exist_ok=True)
#os.makedirs(ATTENDANCE_PHOTOS_DIR, exist_ok=True)
#os.makedirs(MODELS_DIR, exist_ok=True)

os.makedirs(FACE_DATA_DIR, exist_ok=True)
os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(TEMP_DIR, exist_ok=True)
os.makedirs(ATTENDANCE_DIR, exist_ok=True)
os.makedirs(PROFILE_PHOTOS_DIR, exist_ok=True)

# Initialize face detector and landmark predictor
face_detector = dlib.get_frontal_face_detector()
landmark_predictor = dlib.shape_predictor("shape_predictor_68_face_landmarks.dat")

# Load or initialize face encodings
#face_data = {}
#if os.path.exists(ENCODINGS_FILE):
#    with open(ENCODINGS_FILE, 'rb') as f:
#        face_data = pickle.load(f)
#        logger.info(f"Loaded {len(face_data)} face encodings")
#else:
#    logger.info("No existing encodings found. Starting with empty database.")

face_encodings = {}
face_names = {}
try:
    with open(os.path.join(MODEL_DIR, 'face_encodings.pkl'), 'rb') as f:
        face_encodings = pickle.load(f)
    with open(os.path.join(MODEL_DIR, 'face_names.pkl'), 'rb') as f:
        face_names = pickle.load(f)
    logger.info(f"Loaded {len(face_encodings)} face encodings")
except FileNotFoundError:
    logger.info("No face encodings found, starting with empty database")

# Load emotion recognition model
emotion_model = None
try:
    emotion_model = tf.keras.models.load_model(os.path.join(MODEL_DIR, 'emotion_model.h5'))
    logger.info("Loaded emotion recognition model")
except:
    logger.warning("No emotion recognition model found, emotion detection will be disabled")

# Pydantic models for request/response
class ImageData(BaseModel):
    image_data: str
    
class UserRegistration(BaseModel):
    user_id: str
    name: str
    image_data: str
    
class VerificationRequest(BaseModel):
    image_data: str
    class_id: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    
class LivenessRequest(BaseModel):
    image_data: str
    
class BatchRegistrationResponse(BaseModel):
    success: bool
    registered_users: List[str]
    failed_users: List[Dict[str, str]]
    
class ModelStats(BaseModel):
    version: str
    total_users: int
    accuracy: float
    last_trained: str
    
# Helper functions
#def decode_image(image_data: str):
#    """Decode base64 image to numpy array"""
#    try:
#        # Remove data URL prefix if present
#        if "base64," in image_data:
#            image_data = image_data.split("base64,")[1]
#        
#        # Decode base64 string to bytes
#        image_bytes = base64.b64decode(image_data)
#        
#        # Convert bytes to numpy array
#        nparr = np.frombuffer(image_bytes, np.uint8)
#        
#        # Decode image
#        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
#        
#        if img is None:
#            raise ValueError("Failed to decode image")
#            
#        return img
#    except Exception as e:
#        logger.error(f"Error decoding image: {str(e)}")
#        raise HTTPException(status_code=400, detail=f"Invalid image data: {str(e)}")

def base64_to_image(base64_string):
    """Convert base64 string to OpenCV image"""
    try:
        # Remove data URL prefix if present
        if 'data:image/' in base64_string:
            base64_string = base64_string.split(',')[1]
        
        # Decode base64 string to bytes
        img_data = base64.b64decode(base64_string)
        
        # Convert bytes to numpy array
        nparr = np.frombuffer(img_data, np.uint8)
        
        # Decode numpy array as image
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise ValueError("Failed to decode image")
            
        return img
    except Exception as e:
        logger.error(f"Error decoding image: {str(e)}")
        raise

def image_to_base64(image):
    """Convert OpenCV image to base64 string"""
    try:
        # Encode image to jpg
        _, buffer = cv2.imencode('.jpg', image)
        # Convert to base64
        base64_string = base64.b64encode(buffer).decode('utf-8')
        return f"data:image/jpeg;base64,{base64_string}"
    except Exception as e:
        logger.error(f"Error encoding image: {str(e)}")
        raise

#def extract_face_encodings(image, model="hog"):
#    """Extract face encodings using face_recognition library with improved accuracy"""
#    # Convert BGR to RGB (face_recognition uses RGB)
#    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
#    
#    # Detect face locations
#    face_locations = face_recognition.face_locations(rgb_image, model=model)
#    
#    if not face_locations:
#        return [], []
#    
#    # Get face encodings
#    face_encodings = face_recognition.face_encodings(rgb_image, face_locations)
#    
#    return face_locations, face_encodings

def detect_faces(image, model="hog"):
    """Detect faces in image and return locations and encodings"""
    # Convert to RGB (face_recognition uses RGB)
    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    # Detect face locations
    face_locations = face_recognition.face_locations(rgb_image, model=model)
    
    if not face_locations:
        return [], []
    
    # Get face encodings
    face_encodings_list = face_recognition.face_encodings(rgb_image, face_locations)
    
    return face_locations, face_encodings_list

#def normalize_face(image, face_location):
#    """Normalize face orientation using facial landmarks"""
#    # Convert BGR to RGB
#    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
#    
#    # Get facial landmarks
#    top, right, bottom, left = face_location
#    rect = dlib.rectangle(left, top, right, bottom)
#    landmarks = landmark_predictor(rgb_image, rect)
#    
#    # Extract eye coordinates
#    left_eye = (landmarks.part(36).x + landmarks.part(39).x) // 2, (landmarks.part(36).y + landmarks.part(39).y) // 2
#    right_eye = (landmarks.part(42).x + landmarks.part(45).x) // 2, (landmarks.part(42).y + landmarks.part(45).y) // 2
#    
#    # Calculate angle for alignment
#    dx = right_eye[0] - left_eye[0]
#    dy = right_eye[1] - left_eye[1]
#    angle = np.degrees(np.arctan2(dy, dx))
#    
#    # Rotate to align eyes horizontally
#    center = ((left + right) // 2, (top + bottom) // 2)
#    rotation_matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
#    aligned_face = cv2.warpAffine(image, rotation_matrix, (image.shape[1], image.shape[0]))
#    
#    return aligned_face

def recognize_faces(face_encodings_list, tolerance=0.6):
    """Recognize faces by comparing with known face encodings"""
    recognized_faces = []
    
    for face_encoding in face_encodings_list:
        # Compare with known faces
        matches = []
        user_ids = []
        
        for user_id, encodings in face_encodings.items():
            # Compare with all encodings for this user
            results = face_recognition.compare_faces(encodings, face_encoding, tolerance=tolerance)
            if True in results:
                matches.append(sum(results) / len(results))  # Average match confidence
                user_ids.append(user_id)
        
        if matches:
            # Get the user with highest match confidence
            best_match_index = np.argmax(matches)
            user_id = user_ids[best_match_index]
            confidence = matches[best_match_index]
            
            recognized_faces.append({
                'user_id': user_id,
                'name': face_names.get(user_id, 'Unknown'),
                'confidence': float(confidence)
            })
        else:
            recognized_faces.append({
                'user_id': None,
                'name': 'Unknown',
                'confidence': 0.0
            })
    
    return recognized_faces

#def check_liveness(image):
#    """Check if the face is a real person and not a photo (anti-spoofing)"""
#    # Convert to HSV color space for texture analysis
#    hsv_image = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
#    
#    # Calculate texture features using Local Binary Patterns
#    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
#    lbp = cv2.createLBPHFaceRecognizer()
#    lbp_features = lbp.compute(gray)
#    
#    # Check for eye blinks and micro-movements (simplified version)
#    # In a real implementation, this would use multiple frames
#    
#    # For demonstration, we'll use a random score above our threshold
#    # In production, use a proper anti-spoofing model
#    liveness_score = np.random.uniform(ANTI_SPOOFING_THRESHOLD, 1.0)
#    
#    return liveness_score > ANTI_SPOOFING_THRESHOLD, liveness_score

def detect_emotion(face_image):
    """Detect emotion in face image"""
    if emotion_model is None:
        return "neutral"
    
    try:
        # Preprocess image for emotion detection
        face_image = cv2.resize(face_image, (48, 48))
        face_image = cv2.cvtColor(face_image, cv2.COLOR_BGR2GRAY)
        face_image = np.expand_dims(face_image, axis=0)
        face_image = np.expand_dims(face_image, axis=-1)
        face_image = face_image / 255.0
        
        # Predict emotion
        emotion_labels = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral']
        emotion_prediction = emotion_model.predict(face_image)
        emotion_index = np.argmax(emotion_prediction)
        
        return emotion_labels[emotion_index]
    except Exception as e:
        logger.error(f"Error detecting emotion: {str(e)}")
        return "neutral"

#def save_attendance_photo(image, user_id, class_id, date):
#    """Save the attendance photo for later verification"""
#    # Create directory structure
#    class_dir = os.path.join(ATTENDANCE_PHOTOS_DIR, class_id)
#    date_dir = os.path.join(class_dir, date)
#    os.makedirs(date_dir, exist_ok=True)
#    
#    # Generate filename with timestamp
#    timestamp = datetime.now().strftime("%H%M%S")
#    filename = f"{user_id}_{timestamp}.jpg"
#    filepath = os.path.join(date_dir, filename)
#    
#    # Save image
#    cv2.imwrite(filepath, image)
#    
#    return filepath

def detect_attention(face_image):
    """Estimate attention level based on eye openness and head pose"""
    # This is a simplified placeholder for attention detection
    # In a real implementation, this would analyze eye aspect ratio, gaze direction, etc.
    
    # For now, return a random value between 0.7 and 1.0
    return np.random.uniform(0.7, 1.0)

#def get_emotion(face_image):
#    """Detect emotion from face image using DeepFace"""
#    try:
#        analysis = DeepFace.analyze(face_image, actions=['emotion'], enforce_detection=False)
#        dominant_emotion = analysis[0]['dominant_emotion']
#        return dominant_emotion
#    except Exception as e:
#        logger.error(f"Error detecting emotion: {str(e)}")
#        return "neutral"

def detect_liveness(image):
    """Check if the face is live (anti-spoofing)"""
    # This is a simplified placeholder for liveness detection
    # In a real implementation, this would check for eye blinks, texture analysis, etc.
    
    # For now, return true with high confidence
    return True, 0.95

#def get_attention_score(face_image):
#    """Estimate attention level based on eye openness and head pose"""
#    try:
#        # Convert to grayscale
#        gray = cv2.cvtColor(face_image, cv2.COLOR_BGR2GRAY)
#        
#        # Detect face
#        faces = face_detector(gray)
#        if not faces:
#            return 0.5  # Default value if no face detected
#        
#        # Get landmarks
#        landmarks = landmark_predictor(gray, faces[0])
#        
#        # Calculate eye aspect ratio (EAR) for attention estimation
#        # Eye landmarks indices
#        left_eye = [(landmarks.part(i).x, landmarks.part(i).y) for i in range(36, 42)]
#        right_eye = [(landmarks.part(i).x, landmarks.part(i).y) for i in range(42, 48)]
#        
#        # Calculate eye aspect ratio
#        def eye_aspect_ratio(eye):
#            # Compute the euclidean distances between the vertical eye landmarks
#            A = np.linalg.norm(np.array(eye[1]) - np.array(eye[5]))
#            B = np.linalg.norm(np.array(eye[2]) - np.array(eye[4]))
#            # Compute the euclidean distance between the horizontal eye landmarks
#            C = np.linalg.norm(np.array(eye[0]) - np.array(eye[3]))
#            # Compute the eye aspect ratio
#            ear = (A + B) / (2.0 * C)
#            return ear
#        
#        left_ear = eye_aspect_ratio(left_eye)
#        right_ear = eye_aspect_ratio(right_eye)
#        ear = (left_ear + right_ear) / 2.0
#        
#        # EAR < 0.2 indicates closed eyes (not attentive)
#        # EAR > 0.25 indicates open eyes (attentive)
#        attention_score = min(1.0, max(0.0, (ear - 0.2) / 0.05))
#        
#        return attention_score
#    except Exception as e:
#        logger.error(f"Error calculating attention: {str(e)}")
#        return 0.5  # Default value on error

def save_face_encoding(user_id, name, face_encoding):
    """Save face encoding for a user"""
    # Add or update face encoding
    if user_id in face_encodings:
        face_encodings[user_id].append(face_encoding)
    else:
        face_encodings[user_id] = [face_encoding]
    
    face_names[user_id] = name
    
    # Save to disk
    with open(os.path.join(MODEL_DIR, 'face_encodings.pkl'), 'wb') as f:
        pickle.dump(face_encodings, f)
    with open(os.path.join(MODEL_DIR, 'face_names.pkl'), 'wb') as f:
        pickle.dump(face_names, f)

def save_attendance_photo(image, class_id, date, recognized_faces, face_locations):
    """Save attendance photo with annotations"""
    try:
        # Create directory for class attendance
        class_dir = os.path.join(ATTENDANCE_DIR, class_id)
        date_dir = os.path.join(class_dir, date)
        os.makedirs(date_dir, exist_ok=True)
        
        # Create a copy of the image for annotation
        annotated_image = image.copy()
        
        # Draw rectangles around faces and add names
        for i, ((top, right, bottom, left), face) in enumerate(zip(face_locations, recognized_faces)):
            # Draw rectangle
            cv2.rectangle(annotated_image, (left, top), (right, bottom), (0, 255, 0), 2)
            
            # Add name and confidence
            name = face['name']
            confidence = face['confidence']
            text = f"{name} ({confidence:.2f})"
            cv2.putText(annotated_image, text, (left, top - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        
        # Save the annotated image
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        image_path = os.path.join(date_dir, f"attendance_{timestamp}.jpg")
        cv2.imwrite(image_path, annotated_image)
        
        # Create a relative path for the image
        relative_path = os.path.join('attendance', class_id, date, f"attendance_{timestamp}.jpg")
        
        return relative_path
    except Exception as e:
        logger.error(f"Error saving attendance photo: {str(e)}")
        return None

def save_profile_photo(user_id, image):
    """Save profile photo for a user"""
    try:
        # Create directory if it doesn't exist
        os.makedirs(PROFILE_PHOTOS_DIR, exist_ok=True)
        
        # Save the image
        image_path = os.path.join(PROFILE_PHOTOS_DIR, f"{user_id}.jpg")
        cv2.imwrite(image_path, image)
        
        # Create a relative path for the image
        relative_path = os.path.join('profile_photos', f"{user_id}.jpg")
        
        return relative_path
    except Exception as e:
        logger.error(f"Error saving profile photo: {str(e)}")
        return None

# API Routes
#@app.get("/")
#async def root():
#    return {"message": "Face Recognition Attendance API", "version": MODEL_VERSION}

@app.route('/')
def index():
    """Root endpoint for health check"""
    return jsonify({
        'status': 'ok',
        'service': 'Face Recognition API',
        'version': '1.0.0'
    })

#@app.post("/register", response_model=dict)
#async def register_face(user_data: UserRegistration):
#    """Register a user's face in the system"""
#    try:
#        user_id = user_data.user_id
#        name = user_data.name
#        
#        # Decode image
#        image = decode_image(user_data.image_data)
#        
#        # Check image quality
#        if image.shape[0] < 100 or image.shape[1] < 100:
#            raise HTTPException(status_code=400, detail="Image too small. Minimum size is 100x100 pixels.")
#        
#        # Check liveness
#        is_live, liveness_score = check_liveness(image)
#        if not is_live:
#            raise HTTPException(status_code=400, detail="Liveness check failed. Please use a real face.")
#        
#        # Detect faces
#        face_locations, face_encodings = extract_face_encodings(image, model="cnn")
#        
#        if not face_locations or not face_encodings:
#            raise HTTPException(status_code=400, detail="No face detected in the image.")
#        
#        if len(face_locations) > 1:
#            raise HTTPException(status_code=400, detail="Multiple faces detected. Please provide an image with only one face.")
#        
#        # Normalize face
#        normalized_face = normalize_face(image, face_locations[0])
#        
#        # Save profile photo
#        profile_photo_path = os.path.join(PROFILE_PHOTOS_DIR, f"{user_id}.jpg")
#        cv2.imwrite(profile_photo_path, normalized_face)
#        
#        # Store face encoding
#        face_data[user_id] = {
#            "name": name,
#            "encoding": face_encodings[0],
#            "profile_photo": profile_photo_path,
#            "registered_at": datetime.now().isoformat(),
#            "model_version": MODEL_VERSION
#        }
#        
#        # Save updated encodings
#        with open(ENCODINGS_FILE, 'wb') as f:
#            pickle.dump(face_data, f)
#        
#        logger.info(f"Registered face for user {user_id} ({name})")
#        
#        return {
#            "success": True,
#            "message": "Face registered successfully",
#            "user_id": user_id,
#            "liveness_score": float(liveness_score)
#        }
#        
#    except HTTPException as e:
#        raise e
#    except Exception as e:
#        logger.error(f"Error registering face: {str(e)}")
#        raise HTTPException(status_code=500, detail=f"Failed to register face: {str(e)}")

@app.route('/register', methods=['POST'])
def register_face():
    """Register a face for a user"""
    data = request.json
    
    if not data or 'user_id' not in data or 'name' not in data or 'image_data' not in data:
        return jsonify({'success': False, 'message': 'Missing required fields'}), 400
    
    try:
        # Decode image
        image = base64_to_image(data['image_data'])
        
        # Check image quality
        if image.shape[0] < 100 or image.shape[1] < 100:
            return jsonify({'success': False, 'message': 'Image too small. Minimum size is 100x100 pixels.'}), 400
        
        # Detect faces
        face_locations, face_encodings_list = detect_faces(image, model="cnn")
        
        if not face_locations:
            return jsonify({'success': False, 'message': 'No face detected in the image'}), 400
        
        if len(face_locations) > 1:
            return jsonify({'success': False, 'message': 'Multiple faces detected. Please provide an image with only one face'}), 400
        
        # Check liveness
        is_live, liveness_score = detect_liveness(image)
        if not is_live:
            return jsonify({'success': False, 'message': 'Liveness check failed. Please use a real face.'}), 400
        
        # Save face encoding
        save_face_encoding(data['user_id'], data['name'], face_encodings_list[0])
        
        # Extract face region
        top, right, bottom, left = face_locations[0]
        face_image = image[top:bottom, left:right]
        
        # Save face image for reference
        user_dir = os.path.join(FACE_DATA_DIR, data['user_id'])
        os.makedirs(user_dir, exist_ok=True)
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        image_path = os.path.join(user_dir, f"{timestamp}.jpg")
        cv2.imwrite(image_path, face_image)
        
        # Save as profile photo
        profile_photo_path = save_profile_photo(data['user_id'], image)
        
        return jsonify({
            'success': True,
            'message': 'Face registered successfully',
            'profile_photo': profile_photo_path
        })
    
    except Exception as e:
        logger.error(f"Error registering face: {str(e)}")
        return jsonify({'success': False, 'message': f'Error registering face: {str(e)}'}), 500

#@app.post("/verify", response_model=dict)
#async def verify_face(verification_data: VerificationRequest):
#    """Verify a face against registered users and mark attendance"""
#    try:
#        # Decode image
#        image = decode_image(verification_data.image_data)
#        
#        # Check liveness
#        is_live, liveness_score = check_liveness(image)
#        if not is_live:
#            raise HTTPException(status_code=400, detail="Liveness check failed. Please use a real face.")
#        
#        # Detect faces
#        face_locations, face_encodings = extract_face_encodings(image, model="cnn")
#        
#        if not face_locations or not face_encodings:
#            return {
#                "success": False,
#                "message": "No faces detected in the image.",
#                "recognized_students": []
#            }
#        
#        # Initialize results
#        recognized_students = []
#        emotion_data = {}
#        attention_data = {}
#        
#        # Process each detected face
#        for i, face_encoding in enumerate(face_encodings):
#            # Extract face region
#            top, right, bottom, left = face_locations[i]
#            face_image = image[top:bottom, left:right]
#            
#            # Get emotion and attention
#            emotion = get_emotion(face_image)
#            attention = get_attention_score(face_image)
#            
#            # Compare with known faces
#            matches = []
#            match_distances = []
#            
#            for user_id, data in face_data.items():
#                # Calculate similarity
#                distance = face_recognition.face_distance([data["encoding"]], face_encoding)[0]
#                similarity = 1 - distance  # Convert distance to similarity (0-1)
#                
#                if similarity > CONFIDENCE_THRESHOLD:
#                    matches.append(user_id)
#                    match_distances.append(similarity)
#            
#            # If we have matches, take the best one
#            if matches:
#                best_match_idx = np.argmax(match_distances)
#                best_match_id = matches[best_match_idx]
#                best_match_confidence = match_distances[best_match_idx]
#                
#                recognized_students.append(best_match_id)
#                emotion_data[best_match_id] = emotion
#                attention_data[best_match_id] = attention
#                
#                # Save attendance photo if class_id and date are provided
#                if verification_data.class_id and verification_data.date:
#                    save_attendance_photo(
#                        image, 
#                        best_match_id, 
#                        verification_data.class_id,
#                        verification_data.date
#                    )
#        
#        logger.info(f"Verified {len(recognized_students)} students")
#        
#        return {
#            "success": True,
#            "message": "Face verification completed",
#            "recognized_students": recognized_students,
#            "emotion_data": emotion_data,
#            "attention_data": attention_data,
#            "liveness_score": float(liveness_score)
#        }
#        
#    except HTTPException as e:
#        raise e
#    except Exception as e:
#        logger.error(f"Error verifying face: {str(e)}")
#        raise HTTPException(status_code=500, detail=f"Failed to verify face: {str(e)}")

@app.route('/verify', methods=['POST'])
def verify_face():
    """Verify faces in an image and return recognized users"""
    data = request.json
    
    if not data or 'image_data' not in data:
        return jsonify({'success': False, 'message': 'Missing image data'}), 400
    
    try:
        # Decode image
        image = base64_to_image(data['image_data'])
        
        # Detect faces
        face_locations, face_encodings_list = detect_faces(image, model="cnn")
        
        if not face_locations:
            return jsonify({
                'success': False,
                'message': 'No faces detected in the image',
                'recognized_students': []
            }), 400
        
        # Recognize faces
        recognized_faces = recognize_faces(face_encodings_list)
        
        # Process additional data
        emotion_data = {}
        attention_data = {}
        recognized_students = []
        
        for i, face in enumerate(recognized_faces):
            if face['user_id']:
                recognized_students.append(face['user_id'])
                
                # Extract face for emotion detection
                top, right, bottom, left = face_locations[i]
                face_image = image[top:bottom, left:right]
                
                # Detect emotion
                emotion = detect_emotion(face_image)
                emotion_data[face['user_id']] = emotion
                
                # Calculate attention score
                attention_score = detect_attention(face_image)
                attention_data[face['user_id']] = float(attention_score)
        
        # Save attendance photo if class_id and date are provided
        photo_url = None
        if 'class_id' in data and 'date' in data:
            photo_url = save_attendance_photo(
                image, 
                data['class_id'], 
                data['date'], 
                recognized_faces, 
                face_locations
            )
        
        return jsonify({
            'success': True,
            'recognized_students': recognized_students,
            'emotion_data': emotion_data,
            'attention_data': attention_data,
            'photo_url': photo_url,
            'message': 'Face verification completed'
        })
    
    except Exception as e:
        logger.error(f"Error verifying face: {str(e)}")
        return jsonify({'success': False, 'message': f'Error verifying face: {str(e)}'}), 500

#@app.delete("/delete/{user_id}", response_model=dict)
#async def delete_face_data(user_id: str):
#    """Delete a user's face data from the system"""
#    try:
#        if user_id not in face_data:
#            raise HTTPException(status_code=404, detail=f"User {user_id} not found in face database")
#        
#        # Remove from face data
#        del face_data[user_id]
#        
#        # Save updated encodings
#        with open(ENCODINGS_FILE, 'wb') as f:
#            pickle.dump(face_data, f)
#        
#        # Remove profile photo if exists
#        profile_photo_path = os.path.join(PROFILE_PHOTOS_DIR, f"{user_id}.jpg")
#        if os.path.exists(profile_photo_path):
#            os.remove(profile_photo_path)
#        
#        logger.info(f"Deleted face data for user {user_id}")
#        
#        return {
#            "success": True,
#            "message": f"Face data for user {user_id} deleted successfully"
#        }
#        
#    except HTTPException as e:
#        raise e
#    except Exception as e:
#        logger.error(f"Error deleting face data: {str(e)}")
#        raise HTTPException(status_code=500, detail=f"Failed to delete face data: {str(e)}")

@app.route('/delete/<user_id>', methods=['DELETE'])
def delete_face_data(user_id):
    """Delete face data for a user"""
    try:
        # Remove from face encodings
        if user_id in face_encodings:
            del face_encodings[user_id]
        
        if user_id in face_names:
            del face_names[user_id]
        
        # Save updated encodings
        with open(os.path.join(MODEL_DIR, 'face_encodings.pkl'), 'wb') as f:
            pickle.dump(face_encodings, f)
        with open(os.path.join(MODEL_DIR, 'face_names.pkl'), 'wb') as f:
            pickle.dump(face_names, f)
        
        # Delete face images
        user_dir = os.path.join(FACE_DATA_DIR, user_id)
        if os.path.exists(user_dir):
            shutil.rmtree(user_dir)
        
        # Delete profile photo
        profile_photo_path = os.path.join(PROFILE_PHOTOS_DIR, f"{user_id}.jpg")
        if os.path.exists(profile_photo_path):
            os.remove(profile_photo_path)
        
        return jsonify({
            'success': True,
            'message': 'Face data deleted successfully'
        })
    
    except Exception as e:
        logger.error(f"Error deleting face data: {str(e)}")
        return jsonify({'success': False, 'message': f'Error deleting face data: {str(e)}'}), 500

#@app.post("/train", response_model=dict)
#async def train_model():
#    """Train or retrain the face recognition model"""
#    try:
#        # In a real implementation, this would retrain a custom model
#        # For this example, we'll just update the model version and timestamp
#        
#        model_version = f"{MODEL_VERSION}.{datetime.now().strftime('%Y%m%d%H%M')}"
#        
#        # Update model version for all face data
#        for user_id in face_data:
#            face_data[user_id]["model_version"] = model_version
#        
#        # Save updated encodings
#        with open(ENCODINGS_FILE, 'wb') as f:
#            pickle.dump(face_data, f)
#        
#        # Save model version info
#        model_info = {
#            "version": model_version,
#            "trained_at": datetime.now().isoformat(),
#            "num_faces": len(face_data)
#        }
#        
#        with open(os.path.join(MODELS_DIR, f"model_info_{model_version}.json"), 'w') as f:
#            json.dump(model_info, f)
#        
#        logger.info(f"Trained model version {model_version} with {len(face_data)} faces")
#        
#        return {
#            "success": True,
#            "message": "Face recognition model trained successfully",
#            "model_version": model_version,
#            "num_faces": len(face_data)
#        }
#        
#    except Exception as e:
#        logger.error(f"Error training model: {str(e)}")
#        raise HTTPException(status_code=500, detail=f"Failed to train model: {str(e)}")

@app.route('/train', methods=['POST'])
def train_model():
    """Train or update the face recognition model"""
    try:
        # In a real implementation, this would retrain the model
        # For now, just return success
        
        return jsonify({
            'success': True,
            'message': 'Model training completed',
            'model_version': datetime.now().strftime('%Y%m%d%H%M'),
            'num_faces': len(face_encodings)
        })
    
    except Exception as e:
        logger.error(f"Error training model: {str(e)}")
        return jsonify({'success': False, 'message': f'Error training model: {str(e)}'}), 500

#@app.post("/liveness", response_model=dict)
#async def check_face_liveness(liveness_data: LivenessRequest):
#    """Check if a face is live (anti-spoofing)"""
#    try:
#        # Decode image
#        image = decode_image(liveness_data.image_data)
#        
#        # Check liveness
#        is_live, liveness_score = check_liveness(image)
#        
#        return {
#            "success": True,
#            "is_live": is_live,
#            "liveness_score": float(liveness_score),
#            "threshold": ANTI_SPOOFING_THRESHOLD
#        }
#        
#    except Exception as e:
#        logger.error(f"Error checking liveness: {str(e)}")
#        raise HTTPException(status_code=500, detail=f"Failed to check liveness: {str(e)}")

@app.route('/liveness', methods=['POST'])
def check_liveness():
    """Check if a face is live (anti-spoofing)"""
    data = request.json
    
    if not data or 'image_data' not in data:
        return jsonify({'success': False, 'message': 'Missing image data'}), 400
    
    try:
        # Decode image
        image = base64_to_image(data['image_data'])
        
        # Check liveness
        is_live, liveness_score = detect_liveness(image)
        
        return jsonify({
            'success': True,
            'is_live': is_live,
            'liveness_score': float(liveness_score)
        })
    
    except Exception as e:
        logger.error(f"Error checking liveness: {str(e)}")
        return jsonify({'success': False, 'message': f'Error checking liveness: {str(e)}'}), 500

#@app.get("/attendance-photos/{class_id}/{date}", response_model=dict)
#async def get_attendance_photos(class_id: str, date: str):
#    """Get attendance photos for a specific class and date"""
#    try:
#        # Check if directory exists
#        photos_dir = os.path.join(ATTENDANCE_PHOTOS_DIR, class_id, date)
#        if not os.path.exists(photos_dir):
#            return {
#                "success": True,
#                "photos": []
#            }
#        
#        # Get all photos
#        photo_files = os.listdir(photos_dir)
#        photos = []
#        
#        for photo_file in photo_files:
#            # Extract user_id from filename
#            user_id = photo_file.split('_')[0]
#            
#            # Get file path
#            file_path = os.path.join(photos_dir, photo_file)
#            
#            # Read image and convert to base64
#            with open(file_path, 'rb') as f:
#                image_bytes = f.read()
#                image_base64 = base64.b64encode(image_bytes).decode('utf-8')
#            
#            # Get timestamp from filename
#            timestamp = photo_file.split('_')[1].split('.')[0]
#            time = f"{timestamp[:2]}:{timestamp[2:4]}:{timestamp[4:6]}"
#            
#            photos.append({
#                "user_id": user_id,
#                "photo": f"data:image/jpeg;base64,{image_base64}",
#                "time": time
#            })
#        
#        return {
#            "success": True,
#            "photos": photos
#        }
#        
#    except Exception as e:
#        logger.error(f"Error getting attendance photos: {str(e)}")
#        raise HTTPException(status_code=500, detail=f"Failed to get attendance photos: {str(e)}")

@app.route('/profile-photo/<user_id>', methods=['GET'])
def get_profile_photo(user_id):
    """Get profile photo for a user"""
    try:
        profile_photo_path = os.path.join(PROFILE_PHOTOS_DIR, f"{user_id}.jpg")
        
        if not os.path.exists(profile_photo_path):
            return jsonify({'success': False, 'message': 'Profile photo not found'}), 404
        
        return send_file(profile_photo_path, mimetype='image/jpeg')
    
    except Exception as e:
        logger.error(f"Error getting profile photo: {str(e)}")
        return jsonify({'success': False, 'message': f'Error getting profile photo: {str(e)}'}), 500

@app.route('/attendance-photo/<class_id>/<date>/<filename>', methods=['GET'])
def get_attendance_photo(class_id, date, filename):
    """Get attendance photo"""
    try:
        photo_path = os.path.join(ATTENDANCE_DIR, class_id, date, filename)
        
        if not os.path.exists(photo_path):
            return jsonify({'success': False, 'message': 'Attendance photo not found'}), 404
        
        return send_file(photo_path, mimetype='image/jpeg')
    
    except Exception as e:
        logger.error(f"Error getting attendance photo: {str(e)}")
        return jsonify({'success': False, 'message': f'Error getting attendance photo: {str(e)}'}), 500

@app.route('/attendance-photos/<class_id>/<date>', methods=['GET'])
def get_attendance_photos(class_id, date):
    """Get all attendance photos for a class and date"""
    try:
        photos_dir = os.path.join(ATTENDANCE_DIR, class_id, date)
        
        if not os.path.exists(photos_dir):
            return jsonify({'success': True, 'photos': []})
        
        photos = []
        for filename in os.listdir(photos_dir):
            if filename.endswith('.jpg'):
                photo_path = os.path.join(photos_dir, filename)
                
                # Read image and convert to base64
                with open(photo_path, 'rb') as f:
                    image_data = f.read()
                    base64_data = base64.b64encode(image_data).decode('utf-8')
                
                # Extract timestamp from filename
                timestamp = filename.replace('attendance_', '').replace('.jpg', '')
                time = datetime.strptime(timestamp, '%Y%m%d_%H%M%S').strftime('%H:%M:%S')
                
                photos.append({
                    'filename': filename,
                    'url': f"/attendance-photo/{class_id}/{date}/{filename}",
                    'data': f"data:image/jpeg;base64,{base64_data}",
                    'time': time
                })
        
        return jsonify({
            'success': True,
            'photos': photos
        })
    
    except Exception as e:
        logger.error(f"Error getting attendance photos: {str(e)}")
        return jsonify({'success': False, 'message': f'Error getting attendance photos: {str(e)}'}), 500

#@app.get("/profile-photo/{user_id}", response_model=dict)
#async def get_profile_photo(user_id: str):
#    """Get a user's profile photo"""
#    try:
#        # Check if user exists
#        if user_id not in face_data:
#            raise HTTPException(status_code=404, detail=f"User {user_id} not found")
#        
#        # Get profile photo path
#        profile_photo_path = os.path.join(PROFILE_PHOTOS_DIR, f"{user_id}.jpg")
#        
#        if not os.path.exists(profile_photo_path):
#            raise HTTPException(status_code=404, detail=f"Profile photo for user {user_id} not found")
#        
#        # Read image and convert to base64
#        with open(profile_photo_path, 'rb') as f:
#            image_bytes = f.read()
#            image_base64 = base64.b64encode(image_bytes).decode('utf-8')
#        
#        return {
#            "success": True,
#            "user_id": user_id,
#            "name": face_data[user_id]["name"],
#            "photo": f"data:image/jpeg;base64,{image_base64}"
#        }
#        
#    except HTTPException as e:
#        raise e
#    except Exception as e:
#        logger.error(f"Error getting profile photo: {str(e)}")
#        raise HTTPException(status_code=500, detail=f"Failed to get profile photo: {str(e)}")

#@app.post("/batch-register", response_model=BatchRegistrationResponse)
#async def batch_register_faces(file: UploadFile = File(...)):
#    """Register multiple faces from a CSV file with base64 encoded images"""
#    try:
#        # Read CSV file
#        contents = await file.read()
#        
#        # Parse CSV
#        import csv
#        from io import StringIO
#        
#        csv_text = contents.decode('utf-8')
#        csv_reader = csv.DictReader(StringIO(csv_text))
#        
#        registered_users = []
#        failed_users = []
#        
#        for row in csv_reader:
#            try:
#                user_id = row.get('user_id')
#                name = row.get('name')
#                image_data = row.get('image_data')
#                
#                if not user_id or not name or not image_data:
#                    failed_users.append({
#                        "user_id": user_id or "unknown",
#                        "reason": "Missing required fields"
#                    })
#                    continue
#                
#                # Decode image
#                image = decode_image(image_data)
#                
#                # Check liveness
#                is_live, _ = check_liveness(image)
#                if not is_live:
#                    failed_users.append({
#                        "user_id": user_id,
#                        "reason": "Liveness check failed"
#                    })
#                    continue
#                
#                # Detect faces
#                face_locations, face_encodings = extract_face_encodings(image)
#                
#                if not face_locations or not face_encodings:
#                    failed_users.append({
#                        "user_id": user_id,
#                        "reason": "No face detected"
#                    })
#                    continue
#                
#                if len(face_locations) > 1:
#                    failed_users.append({
#                        "user_id": user_id,
#                        "reason": "Multiple faces detected"
#                    })
#                    continue
#                
#                # Normalize face
#                normalized_face = normalize_face(image, face_locations[0])
#                
#                # Save profile photo
#                profile_photo_path = os.path.join(PROFILE_PHOTOS_DIR, f"{user_id}.jpg")
#                cv2.imwrite(profile_photo_path, normalized_face)
#                
#                # Store face encoding
#                face_data[user_id] = {
#                    "name": name,
#                    "encoding": face_encodings[0],
#                    "profile_photo": profile_photo_path,
#                    "registered_at": datetime.now().isoformat(),
#                    "model_version": MODEL_VERSION
#                }
#                
#                registered_users.append(user_id)
#                
#            except Exception as e:
#                failed_users.append({
#                    "user_id": row.get('user_id', "unknown"),
#                    "reason": str(e)
#                })
#        
#        # Save updated encodings
#        with open(ENCODINGS_FILE, 'wb') as f:
#            pickle.dump(face_data, f)
#        
#        logger.info(f"Batch registered {len(registered_users)} faces, {len(failed_users)} failed")
#        
#        return {
#            "success": True,
#            "registered_users": registered_users,
#            "failed_users": failed_users
#        }
#        
#    except Exception as e:
#        logger.error(f"Error batch registering faces: {str(e)}")
#        raise HTTPException(status_code=500, detail=f"Failed to batch register faces: {str(e)}")

@app.route('/batch-register', methods=['POST'])
def batch_register():
    """Register multiple faces from a CSV file"""
    if 'file' not in request.files:
        return jsonify({'success': False, 'message': 'No file provided'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'success': False, 'message': 'No file selected'}), 400
    
    if not file.filename.endswith('.csv'):
        return jsonify({'success': False, 'message': 'File must be a CSV'}), 400
    
    try:
        # Save file temporarily
        temp_path = os.path.join(TEMP_DIR, f"batch_{uuid.uuid4()}.csv")
        file.save(temp_path)
        
        # Process CSV
        import csv
        
        registered = []
        failed = []
        
        with open(temp_path, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    if 'user_id' not in row or 'name' not in row or 'image_data' not in row:
                        failed.append({
                            'user_id': row.get('user_id', 'unknown'),
                            'reason': 'Missing required fields'
                        })
                        continue
                    
                    # Decode image
                    image = base64_to_image(row['image_data'])
                    
                    # Detect faces
                    face_locations, face_encodings_list = detect_faces(image)
                    
                    if not face_locations:
                        failed.append({
                            'user_id': row['user_id'],
                            'reason': 'No face detected'
                        })
                        continue
                    
                    if len(face_locations) > 1:
                        failed.append({
                            'user_id': row['user_id'],
                            'reason': 'Multiple faces detected'
                        })
                        continue
                    
                    # Save face encoding
                    save_face_encoding(row['user_id'], row['name'], face_encodings_list[0])
                    
                    # Save face image
                    user_dir = os.path.join(FACE_DATA_DIR, row['user_id'])
                    os.makedirs(user_dir, exist_ok=True)
                    
                    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                    image_path = os.path.join(user_dir, f"{timestamp}.jpg")
                    
                    # Extract face
                    top, right, bottom, left = face_locations[0]
                    face_image = image[top:bottom, left:right]
                    cv2.imwrite(image_path, face_image)
                    
                    # Save as profile photo
                    save_profile_photo(row['user_id'], image)
                    
                    registered.append(row['user_id'])
                
                except Exception as e:
                    logger.error(f"Error registering face for {row.get('user_id', 'unknown')}: {str(e)}")
                    failed.append({
                        'user_id': row.get('user_id', 'unknown'),
                        'reason': str(e)
                    })
        
        # Clean up
        os.remove(temp_path)
        
        return jsonify({
            'success': True,
            'registered': registered,
            'failed': failed,
            'message': f'Registered {len(registered)} faces, {len(failed)} failed'
        })
    
    except Exception as e:
        logger.error(f"Error batch registering faces: {str(e)}")
        return jsonify({'success': False, 'message': f'Error batch registering faces: {str(e)}'}), 500

#@app.get("/model-stats", response_model=ModelStats)
#async def get_model_stats():
#    """Get statistics about the face recognition model"""
#    try:
#        # Get the latest model info
#        model_files = [f for f in os.listdir(MODELS_DIR) if f.startswith("model_info_")]
#        
#        if not model_files:
#            # If no model info files, use current data
#            return {
#                "version": MODEL_VERSION,
#                "total_users": len(face_data),
#                "accuracy": 0.95,  # Placeholder
#                "last_trained": datetime.now().isoformat()
#            }
#        
#        # Sort by creation time (newest first)
#        model_files.sort(key=lambda x: os.path.getctime(os.path.join(MODELS_DIR, x)), reverse=True)
#        latest_model_file = model_files[0]
#        
#        with open(os.path.join(MODELS_DIR, latest_model_file), 'r') as f:
#            model_info = json.load(f)
#        
#        return {
#            "version": model_info.get("version", MODEL_VERSION),
#            "total_users": len(face_data),
#            "accuracy": 0.95,  # Placeholder - in production, calculate from validation set
#            "last_trained": model_info.get("trained_at", datetime.now().isoformat())
#        }
#        
#    except Exception as e:
#        logger.error(f"Error getting model stats: {str(e)}")
#        raise HTTPException(status_code=500, detail=f"Failed to get model stats: {str(e)}")

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=False)

