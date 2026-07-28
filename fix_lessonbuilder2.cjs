const fs = require('fs');
let content = fs.readFileSync('src/components/LessonBuilder.tsx', 'utf8');

const oldPdfLoop = `          for (let i = 1; i <= numPages; i++) {
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

const newPdfLoop = `          for (let i = 1; i <= numPages; i++) {
              const page = await pdf.getPage(i);
              
              // Dynamically scale down to fit within ~800px max width/height
              let unscaledViewport = page.getViewport({ scale: 1.0 });
              let scale = 1.0;
              const maxDim = numPages > 10 ? 400 : 800; // Compress more if many pages
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
              const dataUrl = canvas.toDataURL('image/webp', numPages > 10 ? 0.3 : 0.6);
              newUrls.push(dataUrl);
          }`;

content = content.replace(oldPdfLoop, newPdfLoop);
fs.writeFileSync('src/components/LessonBuilder.tsx', content);
