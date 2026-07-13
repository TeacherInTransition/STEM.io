import React from 'react';

interface TranslationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TranslationSidebar({ isOpen, onClose }: TranslationSidebarProps) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-[2px] z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Slide-out Panel */}
      <aside
        className={`absolute top-0 right-0 bottom-0 w-[340px] bg-slate-base border-l border-slate-panel shadow-[-10px_0_30px_rgba(0,0,0,0.5)] z-50 p-6 flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="m-0 text-cyan-neon font-bold text-lg">บทแปลบทเรียน (Thai)</h3>
          <button 
            onClick={onClose}
            className="bg-transparent border-none text-text-main text-xl cursor-pointer hover:text-text-muted"
          >
            ✕
          </button>
        </div>
        
        <div className="font-sans text-[16px] leading-[1.8] text-text-muted overflow-y-auto pr-2">
          <strong>โครงสร้างของข้อความระบบ (System Message)</strong>
          <br/><br/>
          ในการทดลองนี้ คุณจะได้เรียนรู้วิธีสร้างคำสั่งพื้นฐานเพื่อให้ AI ปฏิบัติตามบริบทที่กำหนด เป้าหมายของคุณคือการจำกัดผลลัพธ์ของ AI ให้ส่งกลับมาเป็นรูปแบบ JSON เท่านั้น ในขณะที่ยังคงรักษากระบวนการคิดที่เป็นเหตุเป็นผลไว้อยู่
          <br/><br/>
          <strong>กิจกรรมที่ต้องทำ:</strong><br/>
          1. กำหนดบทบาทให้ AI เป็น 'สถาปนิก'<br/>
          2. ตั้งค่าโหมดการทำงานเป็น 'แม่นยำ'<br/>
          3. ตรวจสอบว่าโค้ดไม่มีข้อผิดพลาดก่อนรัน
        </div>
      </aside>
    </>
  );
}
