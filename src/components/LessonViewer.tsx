import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ArrowLeft, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';

export default function LessonViewer({ lessonId, onBack }: { lessonId: string, onBack: () => void }) {
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const docRef = doc(db, 'lessons', lessonId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setLesson({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.error("Lesson not found!");
        }
      } catch (e) {
        console.error("Error fetching lesson:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [lessonId]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-white bg-[#090d16]">Loading lesson...</div>;
  }

  if (!lesson) {
    return <div className="flex items-center justify-center min-h-screen text-white bg-[#090d16]">Lesson not found.</div>;
  }

  const slides = lesson.slides || [];
  const quiz = lesson.quiz || [];

    return (
    <div className="flex flex-col min-h-screen bg-[var(--paper)] text-[var(--ink)] font-sans">
      <header className="flex items-center px-6 py-4 bg-[var(--paper-2)] border-b border-[var(--line)] shadow-sm">
        <button onClick={onBack} className="text-[var(--muted)] hover:text-[var(--amber)] mr-4 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">{lesson.lessonTitle}</h1>
      </header>
      <main className="flex-1 overflow-auto p-6 md:p-12 flex flex-col items-center">
        {slides.length > 0 && currentSlide < slides.length && (
          <div className="w-full max-w-4xl bg-[var(--surface)] rounded-[24px] border border-[var(--line)] p-8 flex flex-col items-center shadow-sm relative">
            <h2 className="text-2xl font-bold mb-6 text-center">{slides[currentSlide].title}</h2>
            {slides[currentSlide].imageUrl && (
              <img src={slides[currentSlide].imageUrl} alt={slides[currentSlide].title} className="max-w-full h-auto max-h-[50vh] object-contain rounded-xl mb-6 shadow-sm border border-[var(--line)]/50" />
            )}
            <div className="prose max-w-none text-[var(--muted)] text-lg leading-relaxed text-center" dangerouslySetInnerHTML={{ __html: slides[currentSlide].content }} />
          </div>
        )}
        {currentSlide === slides.length && (
          <div className="w-full max-w-4xl flex flex-col items-center gap-8">
            {lesson.media?.videoUrl && (
              <div className="w-full bg-[var(--surface)] rounded-[24px] border border-[var(--line)] p-8 flex flex-col items-center shadow-sm">
                <h2 className="text-2xl font-bold mb-6 text-center">Video Resource</h2>
                <iframe 
                  src={lesson.media.videoUrl} 
                  className="w-full aspect-video rounded-xl"
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
            )}
            {quiz.length > 0 && (
              <div className="w-full max-w-2xl bg-[var(--surface)] rounded-[24px] border border-[var(--line)] p-8 flex flex-col items-center shadow-sm">
                <h2 className="text-2xl font-bold text-[var(--amber)] mb-8 text-center flex items-center gap-3">
                  <CheckCircle size={28} /> Knowledge Check
                </h2>
                <h3 className="text-xl font-medium mb-6 text-center">{quiz[0].question}</h3>
                <div className="w-full flex flex-col gap-3">
                  {quiz[0].options.map((opt, idx) => (
                    <button key={idx} className="w-full py-4 px-6 text-left bg-[var(--paper-2)] hover:bg-[var(--paper-2)]/80 rounded-xl transition-colors border border-[var(--line)] hover:border-[var(--amber)]">
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {(!lesson.media?.videoUrl && quiz.length === 0) && (
              <div className="text-xl font-bold">Lesson Completed!</div>
            )}
          </div>
        )}
        <div className="mt-8 flex items-center gap-4">
          <button 
            disabled={currentSlide === 0}
            onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
            className="w-12 h-12 flex items-center justify-center bg-[var(--surface)] hover:bg-[var(--paper-2)] rounded-full border border-[var(--line)] disabled:opacity-50 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          
          <div className="text-[var(--muted)] font-medium">
            {currentSlide < slides.length ? `Slide ${currentSlide + 1} of ${slides.length}` : 'Quiz Time'}
          </div>

          <button 
            disabled={currentSlide >= slides.length || (currentSlide === slides.length && quiz.length === 0)}
            onClick={() => setCurrentSlide(prev => Math.min(slides.length, prev + 1))}
            className="w-12 h-12 flex items-center justify-center bg-[var(--surface)] hover:bg-[var(--paper-2)] rounded-full border border-[var(--line)] disabled:opacity-50 transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </main>
    </div>
  );
}
