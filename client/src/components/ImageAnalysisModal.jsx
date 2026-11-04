import React, { useState } from 'react';
import {
  Camera,
  Upload,
  X,
  Scan,
  CheckCircle,
  AlertOctagon,
  HelpCircle,
  ShieldAlert,
  Loader2,
  FileImage,
  Info,
  Ruler,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { placeService } from '../services/api';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function ImageAnalysisModal({ isOpen, onClose, place, initialPhotoUrl }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initialPhotoUrl || null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // 1. Client-side file type validation
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setError(
        `Unsupported file type (${file.type || 'unknown'}). Please select a JPEG, PNG, or WebP image.`
      );
      return;
    }

    // 2. Client-side file size validation
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(
        `File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 5 MB.`
      );
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setAnalysisResult(null);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(initialPhotoUrl || null);
    setAnalysisResult(null);
    setError(null);
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    setError(null);

    try {
      let res;
      if (selectedFile) {
        const formData = new FormData();
        formData.append('image', selectedFile);
        if (place?.name) formData.append('placeName', place.name);
        if (place?.category) formData.append('placeCategory', place.category);
        res = await placeService.analyzeImage(formData);
      } else if (previewUrl) {
        res = await placeService.analyzeImage({
          imageUrl: previewUrl,
          placeName: place?.name,
          placeCategory: place?.category,
          fileName: previewUrl.split('/').pop()
        });
      } else {
        throw new Error('Please select an image file to analyze.');
      }

      if (res.data?.success && res.data?.data) {
        setAnalysisResult(res.data.data);
      } else {
        throw new Error(res.data?.message || 'Image analysis returned no data.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Error occurred while analyzing image.'
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const isGeminiModel =
    analysisResult?.model === 'gemini-1.5-flash' ||
    analysisResult?.engine?.toLowerCase().includes('gemini');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vision-modal-title"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <h3 id="vision-modal-title" className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Computer Vision Accessibility Scanner
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Evidence-based visual detection of ramps, handrails, lifts, and architectural obstacles
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label="Close image scanner dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="py-4 space-y-4 overflow-y-auto flex-1 pr-1">
          {/* File Picker / Preview area */}
          <div className="space-y-3">
            {previewUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 flex items-center justify-center max-h-56">
                <img
                  src={previewUrl}
                  alt="Analyzing for accessibility"
                  className="max-h-56 w-auto object-contain"
                />
                <label className="absolute bottom-2 right-2 px-3 py-1 bg-black/70 hover:bg-black text-white text-xs font-semibold rounded-lg cursor-pointer flex items-center gap-1.5 backdrop-blur-sm transition">
                  <Camera className="w-3.5 h-3.5" />
                  <span>Choose Another Photo</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 transition bg-slate-50 dark:bg-slate-800/40">
                <FileImage className="w-10 h-10 text-slate-400 mb-2" />
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Select or drop a photo to analyze
                </span>
                <span className="text-xs text-slate-500 mt-1">
                  Supports JPEG, PNG, WebP (Max 5MB)
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}

            {previewUrl && !analysisResult && (
              <button
                type="button"
                onClick={runAnalysis}
                disabled={analyzing}
                className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm transition flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Accessibility Features...</span>
                  </>
                ) : (
                  <>
                    <Scan className="w-4 h-4" />
                    <span>Scan Image for Accessibility</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Analysis Results Display */}
          {analysisResult && (
            <div className="space-y-4 animate-fadeIn">
              {/* Engine Provenance & Verdict Card */}
              <div className="p-4 bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900 rounded-xl space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider">
                    Visual Scan Findings
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border border-purple-300 dark:border-purple-800">
                    {isGeminiModel
                      ? 'Google Gemini 1.5 Flash Vision'
                      : 'Local Architectural Heuristic (Offline)'}
                  </span>
                </div>

                <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {analysisResult.overallAssessment}
                </div>

                {analysisResult.sceneDescription && (
                  <div className="text-xs text-slate-600 dark:text-slate-300 italic">
                    Scene: {analysisResult.sceneDescription}
                  </div>
                )}

                {analysisResult.plainLanguageExplanation && (
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pt-1">
                    {analysisResult.plainLanguageExplanation}
                  </p>
                )}
              </div>

              {/* Provisional Notice Banner (Crucial Integrity Constraint) */}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-xl flex items-start gap-2 text-xs text-amber-900 dark:text-amber-200">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Provisional Evidence:</strong> This visual analysis does NOT modify verified database records. Official accessibility certification requires an authorized on-site field audit with calibrated tools.
                </span>
              </div>

              {/* Detected Features (Assets) */}
              {analysisResult.featuresDetected && analysisResult.featuresDetected.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Detected Accessibility Assets ({analysisResult.featuresDetected.length})</span>
                  </h4>
                  <div className="space-y-2">
                    {analysisResult.featuresDetected.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 rounded-xl flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold text-emerald-950 dark:text-emerald-200 text-sm">
                            {item.feature}
                          </div>
                          {item.observedEvidence && (
                            <div className="text-slate-700 dark:text-slate-300 font-medium">
                              <span className="font-semibold text-emerald-800 dark:text-emerald-300">Observed:</span>{' '}
                              {item.observedEvidence}
                            </div>
                          )}
                          <div className="text-slate-600 dark:text-slate-400">
                            {item.details}
                          </div>
                        </div>
                        <span
                          className="shrink-0 font-mono text-[11px] bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded font-bold"
                          title={isGeminiModel ? 'Neural Vision Confidence' : 'Heuristic Rule Match Score'}
                        >
                          {isGeminiModel
                            ? `${item.confidence}% AI confidence`
                            : `Heuristic: ${item.confidence}/100`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detected Barriers (Obstacles) */}
              {analysisResult.obstaclesDetected && analysisResult.obstaclesDetected.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertOctagon className="w-4 h-4 text-rose-600" />
                    <span>Detected Physical Barriers ({analysisResult.obstaclesDetected.length})</span>
                  </h4>
                  <div className="space-y-2">
                    {analysisResult.obstaclesDetected.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 rounded-xl flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold text-rose-950 dark:text-rose-200 text-sm">
                            {item.barrier}
                          </div>
                          {item.observedEvidence && (
                            <div className="text-slate-700 dark:text-slate-300 font-medium">
                              <span className="font-semibold text-rose-800 dark:text-rose-300">Observed:</span>{' '}
                              {item.observedEvidence}
                            </div>
                          )}
                          <div className="text-slate-600 dark:text-slate-400">
                            {item.details}
                          </div>
                        </div>
                        <span className="shrink-0 font-mono text-[11px] bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200 px-2 py-0.5 rounded font-bold">
                          {item.severity || 'Obstacle'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cannot Determine From Image / Unobservable Conditions */}
              {analysisResult.uncertainOrUnobservable && analysisResult.uncertainOrUnobservable.length > 0 && (
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                    <span>Unobservable from 2D Image Alone (Cannot Certify)</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 pl-1">
                    {analysisResult.uncertainOrUnobservable.map((unc, idx) => (
                      <li key={idx}>{unc}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommended On-Site Follow-Up Checks */}
              {analysisResult.followUpChecks && analysisResult.followUpChecks.length > 0 && (
                <div className="p-3.5 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-900/60 space-y-1.5 text-xs">
                  <div className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                    <Ruler className="w-3.5 h-3.5 text-blue-600" />
                    <span>Recommended On-Site Physical Checks</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 pl-1">
                    {analysisResult.followUpChecks.map((check, idx) => (
                      <li key={idx}>{check}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs space-y-1 border border-slate-200 dark:border-slate-700">
                  <div className="font-semibold text-slate-700 dark:text-slate-300">
                    Visitor Guidance:
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-400">
                    {analysisResult.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Re-analyze action */}
              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Scan Another Image</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
