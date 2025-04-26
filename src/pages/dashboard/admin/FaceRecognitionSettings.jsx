"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Switch } from "../../../components/ui/switch"
import { Slider } from "../../../components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { toast } from "react-toastify"
import axios from "axios"

const FaceRecognitionSettings = () => {
  const [settings, setSettings] = useState({
    faceServiceUrl: process.env.FACE_SERVICE_URL || "http://localhost:5001",
    confidenceThreshold: 0.6,
    enableLivenessDetection: true,
    enableEmotionDetection: true,
    enableAttentionDetection: false,
    maxFacesPerImage: 10,
    saveAttendancePhotos: true,
    photoRetentionDays: 30,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [testResult, setTestResult] = useState(null)

  useEffect(() => {
    // Load settings from server
    const loadSettings = async () => {
      try {
        const response = await axios.get("/api/admin/settings/face-recognition")
        if (response.data.success) {
          setSettings(response.data.settings)
        }
      } catch (error) {
        console.error("Error loading face recognition settings:", error)
        toast.error("Failed to load face recognition settings")
      }
    }

    loadSettings()
  }, [])

  const handleSaveSettings = async () => {
    setIsLoading(true)
    try {
      const response = await axios.post("/api/admin/settings/face-recognition", settings)
      if (response.data.success) {
        toast.success("Face recognition settings saved successfully")
      } else {
        toast.error("Failed to save settings")
      }
    } catch (error) {
      console.error("Error saving face recognition settings:", error)
      toast.error("Failed to save settings")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestConnection = async () => {
    setIsLoading(true)
    setTestResult(null)
    try {
      const response = await axios.get(
        `/api/admin/test-face-service?url=${encodeURIComponent(settings.faceServiceUrl)}`,
      )
      setTestResult({
        success: response.data.success,
        message: response.data.message,
        details: response.data.details || {},
      })

      if (response.data.success) {
        toast.success("Connection to face recognition service successful")
      } else {
        toast.error("Connection to face recognition service failed")
      }
    } catch (error) {
      console.error("Error testing face recognition service:", error)
      setTestResult({
        success: false,
        message: "Connection failed",
        details: { error: error.message },
      })
      toast.error("Connection to face recognition service failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetrainModel = async () => {
    setIsLoading(true)
    try {
      const response = await axios.post("/api/admin/retrain-face-model")
      if (response.data.success) {
        toast.success("Face recognition model retraining initiated")
      } else {
        toast.error("Failed to initiate model retraining")
      }
    } catch (error) {
      console.error("Error retraining face model:", error)
      toast.error("Failed to initiate model retraining")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Face Recognition Settings</h1>

      <Tabs defaultValue="general">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="detection">Detection</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="faceServiceUrl">Face Recognition Service URL</Label>
                <Input
                  id="faceServiceUrl"
                  value={settings.faceServiceUrl}
                  onChange={(e) => setSettings({ ...settings, faceServiceUrl: e.target.value })}
                  placeholder="http://localhost:5001"
                />
              </div>

              <div className="flex items-center justify-between">
                <Button onClick={handleTestConnection} disabled={isLoading}>
                  Test Connection
                </Button>

                {testResult && (
                  <div className={`text-sm ${testResult.success ? "text-green-500" : "text-red-500"}`}>
                    {testResult.message}
                  </div>
                )}
              </div>

              {testResult && testResult.details && Object.keys(testResult.details).length > 0 && (
                <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                  <pre>{JSON.stringify(testResult.details, null, 2)}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detection">
          <Card>
            <CardHeader>
              <CardTitle>Detection Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="confidenceThreshold">Recognition Confidence Threshold</Label>
                  <span className="text-sm">{settings.confidenceThreshold.toFixed(2)}</span>
                </div>
                <Slider
                  id="confidenceThreshold"
                  min={0.1}
                  max={1.0}
                  step={0.05}
                  value={[settings.confidenceThreshold]}
                  onValueChange={(value) => setSettings({ ...settings, confidenceThreshold: value[0] })}
                />
                <p className="text-sm text-gray-500">
                  Higher values require more confidence for a match (fewer false positives, more false negatives)
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enableLivenessDetection"
                  checked={settings.enableLivenessDetection}
                  onCheckedChange={(checked) => setSettings({ ...settings, enableLivenessDetection: checked })}
                />
                <Label htmlFor="enableLivenessDetection">Enable Liveness Detection</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enableEmotionDetection"
                  checked={settings.enableEmotionDetection}
                  onCheckedChange={(checked) => setSettings({ ...settings, enableEmotionDetection: checked })}
                />
                <Label htmlFor="enableEmotionDetection">Enable Emotion Detection</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enableAttentionDetection"
                  checked={settings.enableAttentionDetection}
                  onCheckedChange={(checked) => setSettings({ ...settings, enableAttentionDetection: checked })}
                />
                <Label htmlFor="enableAttentionDetection">Enable Attention Detection</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxFacesPerImage">Maximum Faces Per Image</Label>
                <Input
                  id="maxFacesPerImage"
                  type="number"
                  min={1}
                  max={50}
                  value={settings.maxFacesPerImage}
                  onChange={(e) => setSettings({ ...settings, maxFacesPerImage: Number.parseInt(e.target.value) })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage">
          <Card>
            <CardHeader>
              <CardTitle>Storage Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="saveAttendancePhotos"
                  checked={settings.saveAttendancePhotos}
                  onCheckedChange={(checked) => setSettings({ ...settings, saveAttendancePhotos: checked })}
                />
                <Label htmlFor="saveAttendancePhotos">Save Attendance Photos</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="photoRetentionDays">Photo Retention Period (days)</Label>
                <Input
                  id="photoRetentionDays"
                  type="number"
                  min={1}
                  max={365}
                  value={settings.photoRetentionDays}
                  onChange={(e) => setSettings({ ...settings, photoRetentionDays: Number.parseInt(e.target.value) })}
                  disabled={!settings.saveAttendancePhotos}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Button onClick={handleRetrainModel} disabled={isLoading} variant="outline">
                  Retrain Face Recognition Model
                </Button>
                <p className="text-sm text-gray-500">
                  This will initiate retraining of the face recognition model with all registered face data. This
                  process may take several minutes.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSaveSettings} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  )
}

export default FaceRecognitionSettings
