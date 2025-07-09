import React, { useRef, useState } from "react";
import { Camera, Upload, Play, AlertCircle, CheckCircle, X, Activity, Eye, Sparkles, Target, TrendingUp } from "lucide-react";
import { toast } from "react-toastify";

export default function VideoInput() {
  const [videoFile, setVideoFile] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [mode, setMode] = useState("desk");
  const webcamRef = useRef(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
      setCapturedImage(null);
      setShowWebcam(false);
    } else if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setCapturedImage(reader.result);
        setVideoFile(null);
        setShowWebcam(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWebcamToggle = () => {
    setShowWebcam(true);
    setVideoFile(null);
    setCapturedImage(null);
  };

  const captureWebcamImage = () => {
    const video = webcamRef.current;
    if (!video) return null;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg');
  };

  const handleSubmit = async () => {
    setAnalysisResult(null);
    setIsAnalyzing(true);

    try {
      if (showWebcam) {
        const screenshot = captureWebcamImage();
        if (!screenshot) {
          toast("Could not capture webcam image", 'error');
          setIsAnalyzing(false);
          return;
        }

        setCapturedImage(screenshot);

        const res = await fetch("http://localhost:5000/api/analyze-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: screenshot, mode }),
        });

        const data = await res.json();
        setAnalysisResult(data);
        toast("Webcam image analyzed successfully!", 'success');
      } else if (capturedImage) {
        const res = await fetch("http://localhost:5000/api/analyze-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: capturedImage, mode }),
        });

        const data = await res.json();
        setAnalysisResult(data);
        toast("Image analyzed successfully!", 'success');
      } else if (videoFile) {
        const formData = new FormData();
        formData.append("video", videoFile);
        formData.append("mode", mode);

        const res = await fetch("http://localhost:5000/api/analyze-video", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        setAnalysisResult(data);
        toast("Video analyzed successfully!", 'success');
      } else {
        toast("Please upload a video/image or use webcam.", 'warning');
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast("Something went wrong while analyzing.", 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearInput = () => {
    setVideoFile(null);
    setCapturedImage(null);
    setAnalysisResult(null);
    setShowWebcam(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            PostureAI Pro
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Advanced AI-powered posture analysis with real-time feedback and personalized recommendations
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          {/* Mode Selection */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Target className="w-4 h-4 text-white" />
                <label className="text-white font-semibold">
                  Activity Type
                </label>
              </div>
              <div className="relative">
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="appearance-none bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-2 py-2 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300 pr-12 cursor-pointer"
                >
                  <option value="desk" className="text-gray-800 bg-white text-sm">🪑 Desk Sitting Analysis</option>
                  <option value="squat" className="text-gray-800 bg-white text-sm">🏋️ Squat Exercise Form</option>
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div className="p-8 lg:p-12">
            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              {/* File Upload */}
              <div className="relative group">
                <input
                  type="file"
                  accept="video/*,image/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer block w-full p-10 border-2 border-dashed border-gray-300 rounded-3xl hover:border-indigo-400 transition-all duration-300 hover:bg-indigo-50 group-hover:scale-[1.02] transform"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Upload className="w-8 h-8 text-indigo-600" />
                    </div>
                    <p className="text-xl font-bold text-gray-800 mb-3">
                      Upload Media
                    </p>
                    <p className="text-gray-600 mb-2">
                      Drop your video or image here
                    </p>
                    <p className="text-sm text-gray-500">
                      Supports MP4, MOV, JPG, PNG • Max 50MB
                    </p>
                  </div>
                </label>
              </div>

              {/* Webcam Option */}
              <div className="relative group">
                <button
                  onClick={handleWebcamToggle}
                  className="w-full p-10 border-2 border-dashed border-gray-300 rounded-3xl hover:border-emerald-400 transition-all duration-300 hover:bg-emerald-50 group-hover:scale-[1.02] transform"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Camera className="w-8 h-8 text-emerald-600" />
                    </div>
                    <p className="text-xl font-bold text-gray-800 mb-3">
                      Live Camera
                    </p>
                    <p className="text-gray-600 mb-2">
                      Use your webcam for real-time analysis
                    </p>
                    <p className="text-sm text-gray-500">
                      Instant feedback • Privacy protected
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Media Preview */}
            {(showWebcam || capturedImage || videoFile) && (
              <div className="mb-12">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 border border-gray-200 shadow-inner">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
                        <Eye className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="font-bold text-gray-800">Preview</span>
                        <p className="text-sm text-gray-600">Ready for analysis</p>
                      </div>
                    </div>
                    <button
                      onClick={clearInput}
                      className="flex items-center gap-2 px-4 py-2 bg-red-200 text-red-600 hover:bg-red-400 transition-all duration-200 hover:scale-105"
                    >
                      <X className="w-4 h-6" />
                    </button>
                  </div>

                  <div className="rounded-2xl overflow-hidden bg-black shadow-2xl">
                    {showWebcam ? (
                      <div className="relative">
                        <video
                          ref={(video) => {
                            if (video && !video.srcObject) {
                              navigator.mediaDevices.getUserMedia({ 
                                video: {
                                  width: 1280,
                                  height: 720,
                                  facingMode: "user"
                                }
                              })
                                .then(stream => {
                                  video.srcObject = stream;
                                  webcamRef.current = video;
                                })
                                .catch(err => {
                                  console.error('Error accessing webcam:', err);
                                  toast("Could not access webcam", 'error');
                                });
                            }
                          }}
                          autoPlay
                          playsInline
                          muted
  className="w-full h-auto max-h-96 object-contain rounded shadow bg-white"

                        />
                        <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          LIVE
                        </div>
                      </div>
                    ) : capturedImage ? (
                      <img
  src={capturedImage}
  alt="Captured or Uploaded"
  className="w-full h-auto max-h-96 object-contain rounded shadow bg-white"
/>
                    ) : videoFile ? (
                      <video
                        src={URL.createObjectURL(videoFile)}
                        controls
  className="w-full h-auto max-h-96 object-contain rounded shadow bg-white"

                      />
                    ) : null}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={isAnalyzing || (!videoFile && !capturedImage && !showWebcam)}
                className="group relative px-10 py-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold rounded-2xl shadow-2xl hover:shadow-indigo-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transform text-lg"
              >
                {isAnalyzing ? (
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <div className="absolute inset-0 rounded-full border-2 border-white/30"></div>
                    </div>
                    <span className="text-sm p-0">Analyzing Posture...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                      <Play className="w-2 h-2 text-white ml-0.5" />
                    </div>
                    <span className="text-sm p-0">Start Analysis</span>
                  </div>
                )}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </div>

        {/* Analysis Results */}
        {analysisResult && (
          <div className="mt-8 bg-black/30 backdrop-blur-xl rounded-xl shadow-2xl overflow-hidden border border-white/20">
            <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-4">
                  <div className="w-8 h-8 bg-white/20 rounded-2xl flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  Analysis Results
                </h2>
                
              </div>
            </div>
            
            <div className="p-8 lg:p-12">
              {/* Statistics */}
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 text-center border border-blue-100 hover:shadow-lg transition-shadow duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {analysisResult.total_frames || 1}
                  </div>
                  <div className="text-gray-600 font-medium">Total Frames</div>
                </div>
                
                <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-3xl p-8 text-center border border-red-100 hover:shadow-lg transition-shadow duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-red-600 mb-2">
                    {analysisResult.violations?.length || 0}
                  </div>
                  <div className="text-gray-600 font-medium">Issues Found</div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 text-center border border-green-100 hover:shadow-lg transition-shadow duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {analysisResult.violations?.length === 0 ? '100' : 
                     Math.max(0, Math.round(((analysisResult.total_frames || 1) - (analysisResult.violations?.length || 0)) / (analysisResult.total_frames || 1) * 100))}%
                  </div>
                  <div className="text-gray-600 font-medium">Posture Score</div>
                </div>
              </div>

              {/* Violations List */}
              {analysisResult.violations?.length > 0 && (
                <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-3xl p-8 border border-red-100">
                  <h3 className="text-2xl font-bold text-red-700 mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-500 rounded-xl flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-white" />
                    </div>
                    Posture Issues Detected
                  </h3>
                  <div className="max-h-80 overflow-y-auto space-y-4">
                    {analysisResult.violations.map((violation, index) => (
                      <div key={index} className="bg-white rounded-2xl p-6 border border-red-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <span className="text-red-600 font-bold text-lg">
                              {violation.frame || index + 1}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="text-red-800 font-semibold text-lg mb-2">
                              {violation.issue}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-red-600 font-medium">Angle:</span>
                              <span className="bg-red-100 text-red-700 px-3 py-1 rounded-lg font-bold">
                                {violation.value}°
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Success Message */}
              {analysisResult.violations?.length === 0 && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-12 text-center border border-green-100">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-green-700 mb-4">
                    Excellent Posture! 
                  </h3>
                  <p className="text-xl text-green-600 mb-6">
                    No posture violations detected. Your form is perfect!
                  </p>
                  <div className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-2xl font-semibold">
                    <Sparkles className="w-5 h-5" />
                    Keep up the great work!
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}