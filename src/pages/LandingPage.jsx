"use client"

import { useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  UserCheck,
  Shield,
  BarChart,
  Clock,
  Smartphone,
  LineChart,
  CheckCircle,
  ArrowRight,
  Instagram,
  Twitter,
  Linkedin,
  Facebook,
  MapPin,
  Mail,
  Phone,
} from "lucide-react"

const LandingPage = () => {
  const featuresRef = useRef(null)

  useEffect(() => {
    // Handle scroll to anchor links
    const handleHashChange = () => {
      const hash = window.location.hash
      if (hash && document.querySelector(hash)) {
        document.querySelector(hash).scrollIntoView({ behavior: "smooth" })
      }
    }

    window.addEventListener("hashchange", handleHashChange)

    // Check for hash on initial load
    if (window.location.hash) {
      setTimeout(() => {
        handleHashChange()
      }, 100)
    }

    return () => {
      window.removeEventListener("hashchange", handleHashChange)
    }
  }, [])

  const fadeInUpVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
      },
    }),
  }

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3184328/pexels-photo-3184328.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')] bg-cover bg-center"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 lg:py-32 relative z-10">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 lg:pr-12">
              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Modernize Your Attendance System with Face Recognition
              </motion.h1>

              <motion.p
                className="mt-6 text-lg md:text-xl text-primary-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Our AI-powered system revolutionizes attendance tracking for educational institutions. Save time,
                improve accuracy, and eliminate fraud with advanced face recognition technology.
              </motion.p>

              <motion.div
                className="mt-8 flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Link
                  to="/register"
                  className="flex items-center justify-center px-6 py-3 bg-white text-primary-700 rounded-lg shadow-lg hover:bg-primary-50 transition-colors"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="#features"
                  className="flex items-center justify-center px-6 py-3 border border-white text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  Learn More
                </Link>
              </motion.div>
            </div>

            <motion.div
              className="lg:w-1/2 mt-12 lg:mt-0"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <div className="relative w-full rounded-xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.pexels.com/photos/3767393/pexels-photo-3767393.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                  alt="Face Recognition"
                  className="w-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-900/70 to-transparent flex items-end p-6">
                  <div className="bg-white/90 rounded-lg p-4 shadow-lg">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full bg-success-100 flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-success-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-gray-800 font-medium">Face Identified</h3>
                        <p className="text-sm text-gray-600">John Smith - 99.8% match</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div
          className="absolute bottom-0 left-0 right-0 h-16 bg-white"
          style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 0)" }}
        ></div>
      </section>

      {/* Features */}
      <section id="features" ref={featuresRef} className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-gray-900"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Why Choose Our Attendance System?
            </motion.h2>
            <motion.p
              className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Designed for educational institutions that value efficiency, accuracy, and security.
            </motion.p>
          </div>

          <motion.div
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
            variants={staggerChildren}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* Feature 1 */}
            <motion.div
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              variants={fadeInUpVariant}
              custom={0}
            >
              <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <UserCheck className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Facial Recognition</h3>
              <p className="text-gray-600">
                Advanced AI technology accurately identifies students and staff in seconds, eliminating attendance
                fraud.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              variants={fadeInUpVariant}
              custom={1}
            >
              <div className="h-12 w-12 bg-secondary-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-secondary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Time Efficiency</h3>
              <p className="text-gray-600">
                Mark attendance for an entire class in minutes, saving valuable teaching time and administrative effort.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              variants={fadeInUpVariant}
              custom={2}
            >
              <div className="h-12 w-12 bg-accent-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-accent-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Security & Privacy</h3>
              <p className="text-gray-600">
                Enterprise-grade security with data encryption and privacy-focused design to protect sensitive
                information.
              </p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              variants={fadeInUpVariant}
              custom={3}
            >
              <div className="h-12 w-12 bg-success-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart className="h-6 w-6 text-success-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Detailed Analytics</h3>
              <p className="text-gray-600">
                Comprehensive reports and dashboards provide actionable insights on attendance patterns and trends.
              </p>
            </motion.div>

            {/* Feature 5 */}
            <motion.div
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              variants={fadeInUpVariant}
              custom={4}
            >
              <div className="h-12 w-12 bg-warning-100 rounded-lg flex items-center justify-center mb-4">
                <Smartphone className="h-6 w-6 text-warning-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Multi-Device Support</h3>
              <p className="text-gray-600">
                Access the system from any device - works seamlessly on desktops, tablets, and mobile phones.
              </p>
            </motion.div>

            {/* Feature 6 */}
            <motion.div
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              variants={fadeInUpVariant}
              custom={5}
            >
              <div className="h-12 w-12 bg-error-100 rounded-lg flex items-center justify-center mb-4">
                <LineChart className="h-6 w-6 text-error-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Updates</h3>
              <p className="text-gray-600">
                Instant attendance marking with real-time notifications for administrators, teachers, and students.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div
              className="lg:w-1/2"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img
                src="https://images.pexels.com/photos/1181345/pexels-photo-1181345.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="About our system"
                className="rounded-xl shadow-lg"
              />
            </motion.div>

            <div className="lg:w-1/2">
              <motion.h2
                className="text-3xl md:text-4xl font-bold text-gray-900"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                About Our Technology
              </motion.h2>

              <motion.p
                className="mt-6 text-lg text-gray-600"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Our face recognition attendance system combines cutting-edge AI with user-friendly interfaces to create
                a seamless experience for educational institutions.
              </motion.p>

              <motion.p
                className="mt-4 text-lg text-gray-600"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                The system uses sophisticated neural networks trained on diverse datasets to ensure accurate
                identification across different lighting conditions and angles. Our liveness detection prevents spoofing
                attempts, ensuring attendance integrity.
              </motion.p>

              <motion.div
                className="mt-8 grid grid-cols-2 gap-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary-600 mr-2" />
                  <span className="text-gray-700">99.8% Accuracy</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary-600 mr-2" />
                  <span className="text-gray-700">GDPR Compliant</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary-600 mr-2" />
                  <span className="text-gray-700">Liveness Detection</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary-600 mr-2" />
                  <span className="text-gray-700">Cloud Secured</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary-600 mr-2" />
                  <span className="text-gray-700">24/7 Support</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary-600 mr-2" />
                  <span className="text-gray-700">Regular Updates</span>
                </div>
              </motion.div>

              <motion.div
                className="mt-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg shadow-lg hover:bg-primary-700 transition-colors"
                >
                  Try It Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-gray-900"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              What Our Users Say
            </motion.h2>
            <motion.p
              className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Hear from educational institutions that have transformed their attendance systems.
            </motion.p>
          </div>

          <motion.div
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
            variants={staggerChildren}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* Testimonial 1 */}
            <motion.div
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
              variants={fadeInUpVariant}
              custom={0}
            >
              <div className="flex items-center mb-4">
                <div className="flex text-warning-500">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-600 italic mb-6">
                "Implementing this face recognition system has saved our administrative staff countless hours. The
                accuracy is impressive, and our students love the modern approach to attendance."
              </p>
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200">
                  <img
                    src="https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                    alt="User"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="ml-4">
                  <h4 className="text-gray-900 font-medium">Dr. Robert Chen</h4>
                  <p className="text-gray-500 text-sm">Principal, Lincoln High School</p>
                </div>
              </div>
            </motion.div>

            {/* Testimonial 2 */}
            <motion.div
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
              variants={fadeInUpVariant}
              custom={1}
            >
              <div className="flex items-center mb-4">
                <div className="flex text-warning-500">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-600 italic mb-6">
                "The analytics provided by this system have been invaluable for tracking student attendance patterns.
                We've been able to identify and address issues early, resulting in improved attendance rates."
              </p>
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200">
                  <img
                    src="https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                    alt="User"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="ml-4">
                  <h4 className="text-gray-900 font-medium">Sarah Johnson</h4>
                  <p className="text-gray-500 text-sm">Dean, Westfield College</p>
                </div>
              </div>
            </motion.div>

            {/* Testimonial 3 */}
            <motion.div
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
              variants={fadeInUpVariant}
              custom={2}
            >
              <div className="flex items-center mb-4">
                <div className="flex text-warning-500">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-600 italic mb-6">
                "As a teacher, I appreciate how quick and simple it is to take attendance now. The system is intuitive,
                and the support team is always responsive whenever we have questions."
              </p>
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200">
                  <img
                    src="https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                    alt="User"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="ml-4">
                  <h4 className="text-gray-900 font-medium">Michael Torres</h4>
                  <p className="text-gray-500 text-sm">Professor, Tech University</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="text-center lg:text-left mb-8 lg:mb-0">
              <motion.h2
                className="text-3xl font-bold text-white"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                Ready to Modernize Your Attendance System?
              </motion.h2>
              <motion.p
                className="mt-4 text-xl text-primary-100"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Join thousands of institutions using our face recognition technology.
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Link
                to="/register"
                className="flex items-center justify-center px-8 py-4 bg-white text-primary-700 rounded-lg shadow-lg hover:bg-primary-50 transition-colors text-lg font-medium"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-gray-900"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Contact Us
            </motion.h2>
            <motion.p
              className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Have questions or need a demo? Our team is here to help.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <form className="bg-white rounded-xl shadow-lg p-8">
                <div className="mb-6">
                  <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Your name"
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="subject" className="block text-gray-700 font-medium mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="How can we help?"
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="message" className="block text-gray-700 font-medium mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Your message..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg shadow hover:bg-primary-700 transition-colors"
                >
                  Send Message
                </button>
              </form>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-gray-50 rounded-xl p-8 h-full">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h3>

                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5 text-primary-600" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-gray-900">Our Location</h4>
                      <p className="text-gray-600 mt-1">
                        123 Education Street
                        <br />
                        Tech Valley, CA 94043
                        <br />
                        United States
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-5 w-5 text-primary-600" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-gray-900">Phone</h4>
                      <p className="text-gray-600 mt-1">
                        +1 (123) 456-7890
                        <br />
                        +1 (123) 456-7891
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-5 w-5 text-primary-600" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-gray-900">Email</h4>
                      <p className="text-gray-600 mt-1">
                        contact@attendease.com
                        <br />
                        support@attendease.com
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-5 w-5 text-primary-600" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-gray-900">Hours</h4>
                      <p className="text-gray-600 mt-1">
                        Monday - Friday: 9am - 5pm
                        <br />
                        Saturday - Sunday: Closed
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Follow Us</h4>
                  <div className="flex space-x-4">
                    <a
                      href="#"
                      className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white hover:bg-primary-700 transition-colors"
                    >
                      <Facebook size={20} />
                    </a>
                    <a
                      href="#"
                      className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white hover:bg-primary-700 transition-colors"
                    >
                      <Twitter size={20} />
                    </a>
                    <a
                      href="#"
                      className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white hover:bg-primary-700 transition-colors"
                    >
                      <Instagram size={20} />
                    </a>
                    <a
                      href="#"
                      className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white hover:bg-primary-700 transition-colors"
                    >
                      <Linkedin size={20} />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage
