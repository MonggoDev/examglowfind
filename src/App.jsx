import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Search, 
  MessageCircle, 
  Calendar, 
  User, 
  X, 
  Heart, 
  ChevronLeft,
  ChevronRight,
  Filter,
  Check,
  ChevronDown,
  PenSquare,
  Star
} from 'lucide-react';

function ReviewCard({ rev }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const textLimit = 100;
  const shouldTruncate = rev.reviewText.length > textLimit;
  const displayText = isExpanded ? rev.reviewText : rev.reviewText.slice(0, textLimit);

  return (
    <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-[12px] text-gray-400 font-medium">newjeans</p>
          <div className="flex gap-2 text-[11px] md:text-[12px] font-bold mt-0.5">
            <span className="text-brand-pink">{rev.reviewerInfo?.gender || 'Female'}</span>
            <span className="text-gray-300">•</span>
            <span className="text-orange-400">{rev.reviewerInfo?.age || '20s'}</span>
            <span className="text-gray-300">•</span>
            <span className="text-orange-400">{rev.reviewerInfo?.skinType || 'oily'}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            size={14} 
            fill={star <= rev.rating ? "#E67E5F" : "none"} 
            stroke={star <= rev.rating ? "#E67E5F" : "#D1D5DB"} 
            strokeWidth={2.5}
          />
        ))}
      </div>

      {(rev.beforePhotos?.length > 0 || rev.afterPhotos?.length > 0) && (
        <div className="flex gap-2 mb-4">
          {rev.beforePhotos?.length > 0 && (
            <div className="relative flex-1 aspect-square rounded-xl overflow-hidden">
              <img src={rev.beforePhotos[0]} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute top-2 left-2 bg-[#E67E5F] text-white text-[10px] font-bold px-2 py-0.5 rounded-md">Before</div>
            </div>
          )}
          {rev.afterPhotos?.length > 0 && (
            <div className="relative flex-1 aspect-square rounded-xl overflow-hidden">
              <img src={rev.afterPhotos[0]} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">After</div>
            </div>
          )}
        </div>
      )}

      <p className="text-[13px] md:text-[14px] text-gray-700 leading-relaxed font-medium">
        {displayText}
        {shouldTruncate && !isExpanded && (
          <button 
            onClick={() => setIsExpanded(true)}
            className="text-gray-400 ml-1"
          >
            ... more
          </button>
        )}
      </p>
      
      <div className="mt-4 flex items-center gap-3 bg-gray-50 p-2.5 md:p-3.5 rounded-xl border border-gray-100">
        <img src="https://picsum.photos/seed/facial/100/100" className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover" referrerPolicy="no-referrer" />
        <div className="flex-1">
          <p className="text-[11px] md:text-[12px] font-bold uppercase tracking-tight">
            {rev.treatmentTypes?.[0] || "VMA HYDRATING GLASS FACIAL"}
          </p>
          <p className="text-[10px] md:text-[11px] text-gray-400 font-medium">Velasco Medical Aesthetics</p>
        </div>
        <ChevronRight size={16} className="text-gray-300" />
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState('Main');
  const [activeTab, setActiveTab] = useState('Review');
  const [pendingReviews, setPendingReviews] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [showPendingList, setShowPendingList] = useState(false);
  const [showNoReviewsModal, setShowNoReviewsModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showPostedToast, setShowPostedToast] = useState(false);
  const [reviewerInfo, setReviewerInfo] = useState(null);
  const [showReviewerSetup, setShowReviewerSetup] = useState(false);

  const fetchPendingReviews = () => {
    fetch('/api/reviews/pending')
      .then(res => res.json())
      .then(data => setPendingReviews(data))
      .catch(err => console.error("Error fetching pending reviews:", err));
  };

  const fetchReviews = () => {
    fetch('/api/reviews')
      .then(res => res.json())
      .then(data => setReviews(data))
      .catch(err => console.error("Error fetching reviews:", err));
  };

  useEffect(() => {
    fetchPendingReviews();
    fetchReviews();
  }, []);

  const handleReviewClick = () => {
    if (pendingReviews.length > 0) {
      setShowPendingList(true);
    } else {
      setShowNoReviewsModal(true);
    }
  };

  const startWritingReview = (review) => {
    setSelectedReview(review);
    setShowPendingList(false);
    if (!reviewerInfo) {
      setShowReviewerSetup(true);
    } else {
      setView('WriteReview');
    }
  };

  if (showReviewerSetup) {
    return (
      <ReviewerInfoSetup 
        onCancel={() => setShowReviewerSetup(false)}
        onComplete={(info) => {
          setReviewerInfo(info);
          setShowReviewerSetup(false);
          setView('WriteReview');
        }}
      />
    );
  }

  if (view === 'WriteReview' && selectedReview) {
    return (
      <WriteReviewFlow 
        review={selectedReview} 
        reviewerInfo={reviewerInfo}
        onUpdateReviewerInfo={(info) => setReviewerInfo(info)}
        onBack={() => setView('Main')} 
        onSuccess={() => {
          setView('Main');
          setShowPostedToast(true);
          fetchReviews();
          setTimeout(() => setShowPostedToast(false), 3000);
        }}
      />
    );
  }

  return (
    <div className="iphone-x-frame flex flex-col bg-white">
      <header className="px-6 pt-10 pb-4 flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Review</h1>
        <div className="flex gap-4">
          <Search size={22} className="text-gray-800" strokeWidth={2.5} />
          <Heart size={22} className="text-gray-800" strokeWidth={2.5} />
        </div>
      </header>

      <div className="flex border-b border-gray-100 px-4">
        {['All', 'By Concern', 'By Treatment'].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-3 text-sm font-bold relative transition-colors ${
              tab === 'All' ? 'text-black' : 'text-gray-400'
            }`}
          >
            {tab}
            {tab === 'All' && (
              <motion.div 
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-[3px] bg-black"
              />
            )}
          </button>
        ))}
      </div>

      <div className="px-6 py-3 flex justify-between items-center border-b border-gray-50">
        <div className="flex gap-4 items-center">
          <button className="flex items-center gap-1.5 text-[12px] text-gray-500 font-bold">
            <Filter size={14} strokeWidth={3} /> Filter
          </button>
          <div className="h-3 w-[1px] bg-gray-200"></div>
          <button className="flex items-center gap-1.5 text-[12px] bg-gray-100 px-2.5 py-1 rounded-md text-gray-600 font-bold">
            Photo Review <Check size={14} className="text-brand-pink" strokeWidth={4} />
          </button>
        </div>
        <button className="flex items-center gap-1 text-[12px] text-gray-500 font-bold">
          Latest <ChevronDown size={14} strokeWidth={3} />
        </button>
      </div>

      <main className="flex-1 overflow-y-auto no-scrollbar bg-gray-50 p-4">
        {reviews.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
            <p className="text-gray-400 font-bold">No reviews yet. Be the first to share!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviews.map((rev) => (
              <ReviewCard key={rev._id} rev={rev} />
            ))}
          </div>
        )}
      </main>

      {/* Static Elements (FAB & Toast) */}
      <button 
        onClick={handleReviewClick}
        className="absolute bottom-24 right-6 w-14 h-14 bg-[#E67E5F] rounded-full flex items-center justify-center text-white shadow-xl active:scale-95 transition-transform z-40"
      >
        <PenSquare size={26} strokeWidth={2.5} />
      </button>

      {/* Posted Toast */}
      <AnimatePresence>
        {showPostedToast && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#757575] text-white px-6 py-3.5 rounded-xl text-[14px] font-medium shadow-lg whitespace-nowrap"
          >
            Your review has been posted.
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="bottom-nav-shadow bg-white flex justify-around items-center py-3 px-2 border-t border-gray-50">
        <NavButton icon={<Home size={24} />} label="Home" active={activeTab === 'Home'} onClick={() => setActiveTab('Home')} />
        <NavButton icon={<Search size={24} />} label="Explore" active={activeTab === 'Explore'} onClick={() => setActiveTab('Explore')} />
        <NavButton icon={<MessageCircle size={24} />} label="Review" active={activeTab === 'Review'} onClick={() => setActiveTab('Review')} />
        <NavButton icon={<Calendar size={24} />} label="Booking" active={activeTab === 'Booking'} onClick={() => setActiveTab('Booking')} />
        <NavButton icon={<User size={24} />} label="Profile" active={activeTab === 'Profile'} onClick={() => setActiveTab('Profile')} />
      </nav>

      {/* Modals & Overlays */}
      <AnimatePresence>
        {showNoReviewsModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/50">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[24px] w-full max-w-xs overflow-hidden">
              <div className="p-8 text-center relative">
                <button onClick={() => setShowNoReviewsModal(false)} className="absolute top-5 right-5 text-gray-400"><X size={22} strokeWidth={2.5} /></button>
                <h3 className="text-[18px] font-bold mt-2">No Reviews Yet</h3>
                <p className="text-gray-500 text-[14px] mt-4 leading-relaxed font-medium">You&apos;ll be able to share your experience after your visit.</p>
                <button onClick={() => setShowNoReviewsModal(false)} className="w-full bg-brand-pink text-white font-bold py-4 rounded-2xl mt-8 shadow-md">Explore Treatments</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPendingList && (
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed inset-0 z-[70] bg-white flex flex-col">
            <div className="px-6 pt-12 pb-4 flex justify-between items-center">
              <div className="w-10"></div>
              <h2 className="text-[18px] font-bold">Reviews to Write</h2>
              <button onClick={() => setShowPendingList(false)} className="text-gray-400"><X size={26} strokeWidth={2} /></button>
            </div>
            <div className="px-6 py-4">
              <p className="text-[14px] font-bold text-gray-700">You have <span className="text-[#E67E5F]">{pendingReviews.length}</span> Reviews to write</p>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-8">
              {pendingReviews.map((review) => (
                <div key={review.id} className="bg-white border border-gray-100 rounded-[20px] p-5 mb-4 shadow-sm">
                  <div className="flex gap-4 items-center mb-5">
                    <img src={review.image} className="w-14 h-14 rounded-xl object-cover" referrerPolicy="no-referrer" />
                    <div className="flex-1">
                      <h4 className="text-[14px] font-bold leading-tight tracking-tight">{review.title}</h4>
                      <p className="text-[11px] text-gray-400 font-bold mt-1.5">{review.clinic}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mb-5">
                    <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Treatment Date</span>
                    <span className="text-[11px] text-gray-400 font-bold">{review.date}</span>
                  </div>
                  <button onClick={() => startWritingReview(review)} className="w-full py-3.5 border-2 border-brand-pink text-brand-pink rounded-2xl font-bold text-[14px]">Write a Review</button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ReviewerInfoSetup({ onCancel, onComplete, initialInfo = null }) {
  const [gender, setGender] = useState(initialInfo?.gender || null);
  const [age, setAge] = useState(initialInfo?.age || null);
  const [skinTypes, setSkinTypes] = useState(initialInfo?.skinType ? initialInfo.skinType.split(", ") : []);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isEditMode = !!initialInfo;

  const skinTypeOptions = ["Normal", "Dry", "Oily", "Sensitive", "Dehydrated Oily", "Combination"];

  const toggleSkinType = (type) => {
    setSkinTypes(prev => {
      if (prev.includes(type)) return prev.filter(t => t !== type);
      if (prev.length >= 2) {
        return [prev[1], type]; // FIFO logic
      }
      return [...prev, type];
    });
  };

  const isComplete = gender && age && skinTypes.length > 0;
  const hasSelection = gender || age || skinTypes.length > 0;

  const handleClose = () => {
    if (isEditMode) {
      onCancel(); // Close immediately in edit mode without saving
    } else if (hasSelection) {
      setShowConfirmModal(true);
    } else {
      onCancel();
    }
  };

  const handleSave = () => {
    if (isSaving) return;
    setIsSaving(true);
    onComplete({ gender, age, skinType: skinTypes.join(", ") });
  };

  return (
    <div className="iphone-x-frame flex flex-col bg-white">
      <div className="px-6 pt-10 pb-4 flex items-center relative">
        <h2 className="flex-1 text-center text-[18px] font-bold">Reviewer Info</h2>
        <button onClick={handleClose} className="absolute right-6 text-gray-400">
          <X size={24} strokeWidth={2} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-32">
        <div className="py-8">
          <h1 className="text-[24px] md:text-[28px] font-bold leading-tight mb-2">About the Reviewer</h1>
          <p className="text-gray-400 text-[14px] md:text-[15px] leading-relaxed mb-8">
            This helps people with similar backgrounds find useful reviews.
          </p>

          <div className="mb-8">
            <h3 className="text-[14px] font-bold mb-4">Gender</h3>
            <div className="flex flex-wrap gap-2">
              {["Female", "Male", "Prefer not to say"].map(opt => (
                <button
                  key={opt}
                  onClick={() => setGender(gender === opt ? null : opt)}
                  className={`px-5 py-2.5 rounded-full text-[14px] font-medium border transition-all ${
                    gender === opt ? 'border-brand-pink text-brand-pink bg-white' : 'border-gray-200 text-gray-400 bg-white'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-[14px] font-bold mb-4">Age</h3>
            <div className="flex flex-wrap gap-2">
              {["20s", "30s", "40s", "50+"].map(opt => (
                <button
                  key={opt}
                  onClick={() => setAge(age === opt ? null : opt)}
                  className={`px-5 py-2.5 rounded-full text-[14px] font-medium border transition-all ${
                    age === opt ? 'border-brand-pink text-brand-pink bg-white' : 'border-gray-200 text-gray-400 bg-white'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-[14px] font-bold">Skin Type</h3>
              <span className="text-[12px] text-gray-400 font-medium">Select up to 2 skin types</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {skinTypeOptions.map(opt => (
                <button
                  key={opt}
                  onClick={() => toggleSkinType(opt)}
                  className={`px-5 py-2.5 rounded-full text-[14px] font-medium border transition-all ${
                    skinTypes.includes(opt) ? 'border-brand-pink text-brand-pink bg-white' : 'border-gray-200 text-gray-400 bg-white'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 bg-white">
        <button
          disabled={!isComplete || isSaving}
          onClick={handleSave}
          className={`w-full py-4 rounded-2xl font-bold text-[16px] transition-all ${
            isComplete ? 'bg-brand-pink text-white shadow-lg' : 'bg-gray-200 text-gray-400'
          }`}
        >
          {isSaving ? "Saving..." : (isEditMode ? "Save" : "Share your experience")}
        </button>
      </div>

      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[24px] w-full max-w-xs overflow-hidden p-8 text-center"
            >
              <h3 className="text-[18px] font-bold mb-2">You have unsaved changes</h3>
              <p className="text-gray-500 text-[14px] mb-8 leading-relaxed">
                Your progress will be lost if you leave now.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onCancel}
                  className="flex-1 py-3.5 bg-gray-100 text-gray-800 font-bold rounded-xl text-[14px]"
                >
                  Leave
                </button>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-3.5 bg-brand-pink text-white font-bold rounded-xl text-[14px]"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function WriteReviewFlow({ review, reviewerInfo, onUpdateReviewerInfo, onBack, onSuccess }) {
  const [step, setStep] = useState(1);
  const [rating, setRating] = useState(0);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [isDoctorNotSure, setIsDoctorNotSure] = useState(false);
  const [selectedDoctors, setSelectedDoctors] = useState([]);
  const [tempSelectedDoctors, setTempSelectedDoctors] = useState([]);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [showDoctorSelect, setShowDoctorSelect] = useState(false);
  
  // Step 2 State
  const [concerns, setConcerns] = useState("");
  
  // Step 3 State
  const [consultationReview, setConsultationReview] = useState("");
  
  // Step 4 State
  const [reviewText, setReviewText] = useState("");
  const [beforePhotos, setBeforePhotos] = useState([]);
  const [afterPhotos, setAfterPhotos] = useState([]);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [photoType, setPhotoType] = useState(null); // 'before' or 'after'
  const [showToast, setShowToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showEditReviewerInfo, setShowEditReviewerInfo] = useState(false);

  useEffect(() => {
    fetch('/api/doctors')
      .then(res => {
        if (!res.ok) return res.json().then(err => { throw new Error(err.error || 'Failed to fetch doctors') });
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setAvailableDoctors(data);
        } else {
          setAvailableDoctors([]);
        }
      })
      .catch(err => {
        console.error("Error fetching doctors:", err);
      });
  }, []);

  const treatmentTypes = ["Under arm", "Brazilian", "Bikini Line", "Full legs", "Half legs", "Bikini Full Arms", "Chin", "Cheek", "Full Back"];
  
  const getRatingText = (val) => {
    switch(val) {
      case 1: return "Poor";
      case 2: return "Fair";
      case 3: return "Good";
      case 4: return "Very Good!";
      case 5: return "Excellent!";
      default: return "";
    }
  };

  const toggleType = (type) => {
    setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const openDoctorSelect = () => {
    setTempSelectedDoctors([...selectedDoctors]);
    setShowDoctorSelect(true);
  };

  const toggleDoctorSelection = (doc) => {
    setTempSelectedDoctors(prev => {
      const isSelected = prev.find(d => d._id === doc._id);
      if (isSelected) {
        return prev.filter(d => d._id !== doc._id);
      } else {
        return [...prev, doc];
      }
    });
  };

  const handleDone = () => {
    setSelectedDoctors(tempSelectedDoctors);
    if (tempSelectedDoctors.length > 0) {
      setIsDoctorNotSure(false);
    }
    setShowDoctorSelect(false);
  };

  const removeDoctor = (id) => {
    setSelectedDoctors(prev => prev.filter(d => d._id !== id));
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const currentPhotos = photoType === 'before' ? beforePhotos : afterPhotos;
    
    if (currentPhotos.length + files.length > 10) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    const newPhotos = files.map(file => URL.createObjectURL(file));
    if (photoType === 'before') {
      setBeforePhotos(prev => [...prev, ...newPhotos]);
    } else {
      setAfterPhotos(prev => [...prev, ...newPhotos]);
    }
    setShowPhotoOptions(false);
  };

  const removePhoto = (type, index) => {
    if (type === 'before') {
      setBeforePhotos(prev => prev.filter((_, i) => i !== index));
    } else {
      setAfterPhotos(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          treatmentId: review.id,
          rating,
          treatmentTypes: selectedTypes,
          doctors: selectedDoctors.map(d => d._id),
          isDoctorNotSure,
          concerns,
          consultationReview,
          reviewText,
          beforePhotos,
          afterPhotos,
          reviewerInfo: {
            gender: reviewerInfo.gender,
            age: reviewerInfo.age,
            skinType: reviewerInfo.skinType
          }
        })
      });
      if (response.ok) {
        onSuccess(); // Notify success and go back
      } else {
        const err = await response.json();
        alert(err.error || "Failed to submit review");
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      alert("An error occurred while submitting your review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStep1Valid = rating > 0 && selectedTypes.length > 0 && (isDoctorNotSure || selectedDoctors.length > 0);
  const isStep2Valid = concerns.trim().length >= 10;
  const isStep3Valid = consultationReview.trim().length >= 10;
  const isStep4Valid = reviewText.trim().length >= 10;

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-32">
            {/* Treatment Info */}
            <div className="flex gap-4 items-center py-4">
              <img src={review.image} className="w-14 h-14 rounded-xl object-cover" referrerPolicy="no-referrer" />
              <div>
                <h4 className="text-[14px] font-bold leading-tight">{review.title}</h4>
                <p className="text-[12px] text-gray-400 font-medium mt-1">{review.clinic}</p>
              </div>
            </div>

            {/* Reviewer Info */}
            <div className="py-4 border-t border-gray-50">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-[14px] font-bold">Reviewer Info</h3>
                <button onClick={() => setShowEditReviewerInfo(true)} className="text-[12px] text-gray-400 font-bold px-4 py-1.5 border border-gray-200 rounded-lg">Edit</button>
              </div>
              <div className="flex gap-2 text-[12px] font-bold">
                <span className={reviewerInfo.gender === "Prefer not to say" ? "hidden" : "text-brand-pink"}>{reviewerInfo.gender}</span>
                {reviewerInfo.gender !== "Prefer not to say" && <span className="text-gray-300">•</span>}
                <span className="text-orange-400">{reviewerInfo.age}</span>
                <span className="text-gray-300">•</span>
                <span className="text-orange-400">{reviewerInfo.skinType}</span>
              </div>
            </div>

            {/* Rating */}
            <div className="py-6 border-t border-gray-50">
              <h3 className="text-[14px] font-bold mb-6">How would you rate this treatment?</h3>
              <div className="flex flex-col items-center gap-3">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => setRating(star)}>
                      <Star 
                        size={32} 
                        fill={star <= rating ? "#E67E5F" : "none"} 
                        stroke={star <= rating ? "#E67E5F" : "#D1D5DB"} 
                        strokeWidth={2}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-[12px] text-gray-400 font-bold h-4">{getRatingText(rating)}</p>
              </div>
            </div>

            {/* Treatment Type */}
            <div className="py-6 border-t border-gray-50">
              <h3 className="text-[14px] font-bold mb-4">Treatment Type</h3>
              <div className="flex flex-wrap gap-2">
                {treatmentTypes.map(type => (
                  <button 
                    key={type}
                    onClick={() => toggleType(type)}
                    className={`px-4 py-2 rounded-full text-[12px] font-bold border transition-all ${
                      selectedTypes.includes(type) 
                        ? 'bg-[#E67E5F] border-[#E67E5F] text-white' 
                        : 'bg-white border-gray-200 text-gray-400'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Doctor Selection */}
            <div className="py-6 border-t border-gray-50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[14px] font-bold">Doctor in Charge</h3>
                <button 
                  onClick={openDoctorSelect}
                  className="text-[12px] text-brand-pink font-bold px-4 py-2 border border-brand-pink/30 rounded-xl"
                >
                  Select Doctor
                </button>
              </div>

              <label className="flex items-center gap-3 mb-6 cursor-pointer">
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isDoctorNotSure ? 'bg-brand-pink border-brand-pink' : 'border-gray-300'}`}>
                  <input type="checkbox" className="hidden" checked={isDoctorNotSure} onChange={() => { setIsDoctorNotSure(!isDoctorNotSure); if(!isDoctorNotSure) setSelectedDoctors([]); }} />
                  {isDoctorNotSure && <Check size={14} className="text-white" strokeWidth={4} />}
                </div>
                <span className="text-[14px] text-gray-400 font-bold">I&apos;m not sure</span>
              </label>

              {selectedDoctors.map(doc => (
                <div key={doc._id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-2xl mb-3 relative">
                  <img src={doc.image} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <p className="text-[14px] font-bold">{doc.name}</p>
                    <p className="text-[11px] text-gray-400 font-bold">{doc.clinic}</p>
                  </div>
                  <button onClick={() => removeDoctor(doc._id)} className="absolute right-4 text-gray-300"><X size={20} /></button>
                </div>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-32">
            <div className="py-8">
              <h1 className="text-[24px] md:text-[28px] font-bold leading-tight mb-8">
                Why did you choose<br />this treatment? 👩🏻‍🎤
              </h1>

              <div className="mb-6">
                <h3 className="text-[14px] font-bold mb-4">Concerns Before Treatment</h3>
                
                <div className="bg-[#FFF5F2] p-4 rounded-xl mb-4">
                  <p className="text-[12px] text-gray-600 leading-relaxed">
                    Tell us what concerns or reasons led you to decide on this treatment.
                  </p>
                </div>

                <div className="relative">
                  <textarea 
                    value={concerns}
                    onChange={(e) => setConcerns(e.target.value.slice(0, 500))}
                    placeholder="Tell us what concerns or reasons led you to decide on this treatment."
                    className="w-full min-h-[160px] p-4 rounded-2xl border border-gray-100 text-[14px] placeholder:text-gray-300 focus:outline-none focus:border-brand-pink/30 resize-none"
                  />
                  <div className="flex justify-end mt-2">
                    <span className={`text-[12px] font-bold ${concerns.length === 500 ? 'text-red-500' : 'text-gray-300'}`}>
                      {concerns.length}/500
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-32">
            <div className="py-8">
              <h1 className="text-[24px] md:text-[28px] font-bold leading-tight mb-8">
                How was your consultation<br />experience? ✍🏼
              </h1>

              <div className="mb-6">
                <h3 className="text-[14px] font-bold mb-4">Consultation review</h3>
                
                <div className="bg-[#FFF5F2] p-4 rounded-xl mb-4">
                  <p className="text-[12px] text-gray-600 leading-relaxed">
                    Share specific details to help others considering this treatment or clinic.
                  </p>
                </div>

                <div className="relative">
                  <textarea 
                    value={consultationReview}
                    onChange={(e) => setConsultationReview(e.target.value.slice(0, 500))}
                    placeholder="Tell us what concerns or reasons led you to decide on this treatment."
                    className="w-full min-h-[160px] p-4 rounded-2xl border border-gray-100 text-[14px] placeholder:text-gray-300 focus:outline-none focus:border-brand-pink/30 resize-none"
                  />
                  <div className="flex justify-end mt-2">
                    <span className={`text-[12px] font-bold ${consultationReview.length === 500 ? 'text-red-500' : 'text-gray-300'}`}>
                      {consultationReview.length}/500
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-32">
            <div className="py-8">
              <h1 className="text-[24px] md:text-[28px] font-bold leading-tight mb-8">
                Share Your Treatment<br />Experience ✨
              </h1>

              <div className="mb-6">
                <h3 className="text-[14px] font-bold mb-4">Treatment Review</h3>
                
                <div className="bg-[#FFF5F2] p-4 rounded-xl mb-4">
                  <p className="text-[12px] text-gray-600 leading-relaxed">
                    Share your detailed experience to help others make informed decisions.
                  </p>
                </div>

                <div className="relative">
                  <textarea 
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value.slice(0, 500))}
                    placeholder="Tell us what concerns or reasons led you to decide on this treatment."
                    className="w-full min-h-[160px] p-4 rounded-2xl border border-gray-100 text-[14px] placeholder:text-gray-300 focus:outline-none focus:border-brand-pink/30 resize-none"
                  />
                  <div className="flex justify-end mt-2">
                    <span className={`text-[12px] font-bold ${reviewText.length === 500 ? 'text-red-500' : 'text-gray-300'}`}>
                      {reviewText.length}/500
                    </span>
                  </div>
                </div>
              </div>

              {/* Before Photos */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[14px] font-bold">Before Photos</h3>
                  {beforePhotos.length > 0 && (
                    <span className="text-[12px] text-gray-400 font-bold">{beforePhotos.length}/10</span>
                  )}
                </div>
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                  <button 
                    onClick={() => { setPhotoType('before'); setShowPhotoOptions(true); }}
                    className="min-w-[80px] h-[80px] rounded-xl border-2 border-dashed border-gray-100 flex items-center justify-center text-gray-300 bg-gray-50 active:bg-gray-100 transition-colors"
                  >
                    <div className="text-2xl">+</div>
                  </button>
                  {beforePhotos.map((photo, index) => (
                    <div key={index} className="relative min-w-[80px] h-[80px]">
                      <img src={photo} className="w-full h-full rounded-xl object-cover" />
                      <button 
                        onClick={() => removePhoto('before', index)}
                        className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md text-gray-400"
                      >
                        <X size={14} strokeWidth={3} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* After Photos */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[14px] font-bold">After Photos</h3>
                  {afterPhotos.length > 0 && (
                    <span className="text-[12px] text-gray-400 font-bold">{afterPhotos.length}/10</span>
                  )}
                </div>
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                  <button 
                    onClick={() => { setPhotoType('after'); setShowPhotoOptions(true); }}
                    className="min-w-[80px] h-[80px] rounded-xl border-2 border-dashed border-gray-100 flex items-center justify-center text-gray-300 bg-gray-50 active:bg-gray-100 transition-colors"
                  >
                    <div className="text-2xl">+</div>
                  </button>
                  {afterPhotos.map((photo, index) => (
                    <div key={index} className="relative min-w-[80px] h-[80px]">
                      <img src={photo} className="w-full h-full rounded-xl object-cover" />
                      <button 
                        onClick={() => removePhoto('after', index)}
                        className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md text-gray-400"
                      >
                        <X size={14} strokeWidth={3} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const progress = (step / 4) * 100;

  return (
    <div className="iphone-x-frame flex flex-col bg-white">
      {/* Progress Bar */}
      <div className="h-1 bg-gray-100 w-full">
        <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-brand-pink" />
      </div>

      {/* Header */}
      <div className="px-6 pt-10 pb-4 flex items-center relative">
        <button onClick={() => step > 1 ? setStep(step - 1) : onBack()} className="absolute left-6 text-gray-800">
          <ChevronLeft size={24} strokeWidth={2.5} />
        </button>
        <h2 className="flex-1 text-center text-[18px] font-bold">Write a Review</h2>
      </div>

      {renderStep()}

      {/* Sticky CTA */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-50">
        {step < 4 ? (
          <button 
            disabled={
              step === 1 ? !isStep1Valid : 
              step === 2 ? !isStep2Valid : 
              !isStep3Valid
            }
            onClick={() => setStep(step + 1)}
            className={`w-full py-4 rounded-2xl font-bold text-[16px] transition-all ${
              (step === 1 ? isStep1Valid : step === 2 ? isStep2Valid : isStep3Valid) ? 'bg-brand-pink text-white shadow-lg' : 'bg-gray-200 text-gray-400'
            }`}
          >
            Continue
          </button>
        ) : (
          <button 
            disabled={!isStep4Valid || isSubmitting}
            onClick={handleSubmit}
            className={`w-full py-4 rounded-2xl font-bold text-[16px] transition-all ${
              isStep4Valid && !isSubmitting ? 'bg-[#E67E5F] text-white shadow-lg' : 'bg-gray-200 text-gray-400'
            }`}
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </button>
        )}
      </div>

      {/* Doctor Select Modal */}
      <AnimatePresence>
        {showDoctorSelect && (
          <div className="fixed inset-0 z-[80] bg-black/50 flex items-end">
            <motion.div 
              initial={{ y: '100%' }} 
              animate={{ y: 0 }} 
              exit={{ y: '100%' }} 
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="bg-white w-full rounded-t-[32px] overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center px-6 pt-8 pb-4">
                <h3 className="text-[18px] font-bold">Select Doctor</h3>
                <button onClick={handleDone} className="text-brand-pink font-bold text-[16px]">Done</button>
              </div>
              
              <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-12">
                {availableDoctors.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-400 font-bold mb-4">No doctors found</p>
                    <button 
                      onClick={() => {
                        fetch('/api/doctors')
                          .then(res => res.json())
                          .then(data => setAvailableDoctors(data))
                          .catch(err => console.error('Retry failed:', err));
                      }}
                      className="text-brand-pink font-bold text-[14px] underline"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  availableDoctors.map(doc => {
                    const isSelected = !!tempSelectedDoctors.find(d => d._id === doc._id);
                    return (
                      <div 
                        key={doc._id} 
                        onClick={() => toggleDoctorSelection(doc)}
                        className="w-full flex items-center justify-between py-4 border-b border-gray-50 cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <img src={doc.image} className="w-12 h-12 rounded-full object-cover" />
                          <div>
                            <p className="text-[14px] font-bold">{doc.name}</p>
                            <p className="text-[11px] text-gray-400 font-bold">{doc.clinic}</p>
                          </div>
                        </div>
                        <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all ${
                          isSelected ? 'bg-[#E67E5F] border-[#E67E5F]' : 'border-gray-200'
                        }`}>
                          {isSelected && <Check size={16} className="text-white" strokeWidth={4} />}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Photo Options Bottom Sheet */}
      <AnimatePresence>
        {showPhotoOptions && (
          <div className="fixed inset-0 z-[90] bg-black/50 flex items-end" onClick={() => setShowPhotoOptions(false)}>
            <motion.div 
              initial={{ y: '100%' }} 
              animate={{ y: 0 }} 
              exit={{ y: '100%' }} 
              className="bg-white w-full rounded-t-[24px] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <h3 className="text-[18px] font-bold mb-6">Add Photo</h3>
                <div className="space-y-4">
                  <label className="block w-full text-left py-3 text-[16px] font-medium cursor-pointer active:bg-gray-50">
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                    Gallery
                  </label>
                  <label className="block w-full text-left py-3 text-[16px] font-medium cursor-pointer active:bg-gray-50">
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoUpload} />
                    Camera
                  </label>
                </div>
              </div>
              <div className="h-8 bg-white"></div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[100] bg-black/80 text-white px-6 py-3 rounded-full text-[12px] font-bold whitespace-nowrap"
          >
            Maximum 10 photos allowed
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Reviewer Info Modal */}
      <AnimatePresence>
        {showEditReviewerInfo && (
          <div className="fixed inset-0 z-[110] bg-white">
            <ReviewerInfoSetup 
              initialInfo={reviewerInfo}
              onCancel={() => setShowEditReviewerInfo(false)}
              onComplete={(info) => {
                onUpdateReviewerInfo(info);
                setShowEditReviewerInfo(false);
              }}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavButton({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-brand-pink' : 'text-gray-400'}`}>
      <div className={active ? 'scale-110 transition-transform' : ''}>{icon}</div>
      <span className="text-[10px] md:text-[11px] font-bold">{label}</span>
    </button>
  );
}
