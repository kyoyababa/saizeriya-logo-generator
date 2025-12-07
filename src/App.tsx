import { useState, useEffect, useRef } from 'react';
import { RefreshCw, Download } from 'lucide-react';
import logoImage from './assets/o0494037014077419118.png';

export default function SaizeriyaLogoGenerator() {
  const [displayChars, setDisplayChars] = useState<string[]>([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [charImages, setCharImages] = useState<{[key: string]: string}>({});
  const logoContainerRef = useRef<HTMLDivElement>(null);
  
  const chars = ['サ', 'イ', 'ゼ', 'リ', 'ヤ'];
  type CharImageProps = { char: typeof chars[number] };
  
  const CharImage = ({ char }: CharImageProps) => {
    if (!charImages[char]) return null;
    
    return (
      <img 
        src={charImages[char]} 
        alt={char}
        className="md:h-24 object-contain"
        style={{ imageRendering: 'crisp-edges' }}
      />
    );
  };
  
  useEffect(() => {
    const img = new Image();
    img.src = logoImage;
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) return;
      
      const logoHeight = img.height;
      
      // カタカナ部分の位置（画像の下部）
      const textY = 0;
      const textHeight = logoHeight;
      
      const newCharImages: {[key: string]: string} = {};
      
      chars.forEach((char, index) => {
        // 各文字の開始位置
        const charStart = (() => {
          switch (char) {
            case 'サ': return  56;
            case 'イ': return  139;
            case 'ゼ': return  205;
            case 'リ': return  284;
            case 'ヤ': return  352;
            default: return 0;
          }
        })();

        // 各文字の幅
        const charWidth = (() => {
          switch (char) {
            case 'サ': return  83;
            case 'イ': return  67;
            case 'ゼ': return  78;
            case 'リ': return  68;
            case 'ヤ': return  84;
            default: return 0;
          }
        })();

        canvas.width = charWidth;
        canvas.height = textHeight;
        
        // 各文字を切り出し
        ctx.clearRect(0, 0, charWidth, textHeight);
        ctx.drawImage(
          img,
          charStart, textY,
          charWidth, textHeight,
          0, 0,
          charWidth, textHeight
        );
        
        newCharImages[char] = canvas.toDataURL();
      });
      
      setCharImages(newCharImages);
      setImageLoaded(true);
    };
  }, []);
  
  const generateRandomChars = () => {
    const length = Math.floor(Math.random() * 7) + 1;
    const result = [];
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      result.push(chars[randomIndex]);
    }
    return result;
  };
  
  useEffect(() => {
    if (imageLoaded) {
      setDisplayChars(generateRandomChars());
    }
  }, [imageLoaded]);
  
  const handleRegenerate = () => {
    setDisplayChars(generateRandomChars());
  };
  
  const handleDownload = () => {
    if (!logoContainerRef.current) return;
    
    const container = logoContainerRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // コンテナのサイズを取得
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    // 背景色を設定
    ctx.fillStyle = '#16a34a'; // bg-green-600
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 各文字の画像を描画
    const images = container.querySelectorAll('img');
    let loadedCount = 0;
    
    const drawImages = () => {
      let xOffset = (canvas.width - Array.from(images).reduce((sum, img) => sum + img.width, 0)) / 2;
      
      images.forEach((imgElement) => {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, xOffset, (canvas.height - img.height) / 2, imgElement.width, imgElement.height);
          xOffset += imgElement.width;
          loadedCount++;
          
          if (loadedCount === images.length) {
            // すべての画像が描画されたらダウンロード
            canvas.toBlob((blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = 'saizeriya-logo.png';
                link.href = url;
                link.click();
                URL.revokeObjectURL(url);
              }
            });
          }
        };
        img.src = imgElement.src;
      });
    };
    
    drawImages();
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          サイゼリヤロゴチャレンジャー
        </h1>
        
        <div ref={logoContainerRef} className="bg-green-600 rounded-xl mb-8 flex items-center justify-center min-h-[200px]">
          {imageLoaded ? (
            <div className="flex items-center justify-center gap-0">
              {displayChars.map((char, index) => (
                <div key={index} className="inline-block">
                  <CharImage char={char} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-white text-xl">読み込み中...</div>
          )}
        </div>
        
        <button
          onClick={handleRegenerate}
          disabled={!imageLoaded}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-3 text-lg mb-8"
        >
          <RefreshCw className="w-6 h-6" />
          再チャレンジ！
        </button>
        
        <button
          onClick={handleDownload}
          disabled={!imageLoaded}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-3 text-lg mb-8"
        >
          <Download className="w-6 h-6" />
          PNG画像としてダウンロード
        </button>
      </div>
    </div>
  );
}