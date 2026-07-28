const fs = require('fs');
let content = fs.readFileSync('src/components/LessonBuilder.tsx', 'utf8');

// Replace PDF scaling
const oldPdfLoop = `          for (let i = 1; i <= numPages; i++) {
              const page = await pdf.getPage(i);
              const viewport = page.getViewport({ scale: 0.15 });
              
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              if (!ctx) continue;
              
              canvas.height = viewport.height;
              canvas.width = viewport.width;
              
              await page.render({
                  canvasContext: ctx,
                  viewport: viewport
              }).promise;
              
              const dataUrl = canvas.toDataURL('image/jpeg', 0.2);
              newUrls.push(dataUrl);
          }`;

const newPdfLoop = `          for (let i = 1; i <= numPages; i++) {
              const page = await pdf.getPage(i);
              
              // Dynamically scale down to fit within ~800px max width/height
              let unscaledViewport = page.getViewport({ scale: 1.0 });
              let scale = 1.0;
              const maxDim = 800;
              if (unscaledViewport.width > maxDim || unscaledViewport.height > maxDim) {
                  scale = Math.min(maxDim / unscaledViewport.width, maxDim / unscaledViewport.height);
              }
              const viewport = page.getViewport({ scale });
              
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              if (!ctx) continue;
              
              canvas.height = viewport.height;
              canvas.width = viewport.width;
              
              await page.render({
                  canvasContext: ctx,
                  viewport: viewport
              }).promise;
              
              // Use webp for better compression
              const dataUrl = canvas.toDataURL('image/webp', 0.5);
              newUrls.push(dataUrl);
          }`;

content = content.replace(oldPdfLoop, newPdfLoop);

const oldSizeCheck = `          const estimatedSize = JSON.stringify(docData).length;
          if (estimatedSize > 900000) {
              throw new Error("Lesson is too large to publish (over 1MB). If you imported a PDF previously, please try importing it again to compress the images.");
          }`;

const newSizeCheck = `          const estimatedSize = JSON.stringify(docData).length;
          if (estimatedSize > 900000) {
              // Instead of hard-failing, we could attempt to warn them, but for now we'll just throw
              // However, with our new webp compression, this is much less likely to happen.
              throw new Error("Lesson is too large to publish (over 1MB). Please use a smaller PDF or fewer slides.");
          }`;

content = content.replace(oldSizeCheck, newSizeCheck);

const oldButtonClass = `className="w-full py-3 bg-[#6366F1] hover:bg-[#6366F1]/90 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"`;
const newButtonClass = `className="w-full py-3 bg-[var(--amber)] hover:bg-[#92400e] text-white font-bold text-sm rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition flex items-center justify-center gap-2 disabled:opacity-50"`;

content = content.replace(oldButtonClass, newButtonClass);

fs.writeFileSync('src/components/LessonBuilder.tsx', content);
