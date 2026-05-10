import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export default function ChordViewer({ title, artist, rawContent }) {
  const [transposeStep, setTransposeStep] = useState(0);

  const transposeChord = (chord, steps) => {
    const match = chord.match(/^([A-G][#b]?)(.*)$/);
    if (!match) return chord;
    let root = match[1];
    const suffix = match[2];
    if (root === 'Bb') root = 'A#';
    if (root === 'Eb') root = 'D#';
    let index = NOTES.indexOf(root);
    if (index === -1) return chord;
    let newIndex = (index + steps) % 12;
    if (newIndex < 0) newIndex += 12;
    return NOTES[newIndex] + suffix;
  };

  const chordRegex = /(^|\s|[(])([A-G][#b]?)(m|min|maj|sus|dim|aug|add)?(4|5|6|7|9|11|13|\/|(\/[A-G][#b]?))*(?=$|\s|[)])/g;

  const renderContent = () => {
    if (!rawContent) return null;
    const lines = rawContent.split('\n');
    return lines.map((line, idx) => {
      const hasChord = line.match(chordRegex);

      const rowStyle = {
        display: 'block',
        fontFamily: '"Consolas", "Monaco", "Courier New", monospace',
        fontSize: '16px',
        whiteSpace: 'pre',
        margin: '0',
        padding: '0',
        letterSpacing: '0px',
        transform: 'none',
        // ASIL SİHİR: Boşlukları %50 daraltıyoruz (-0.5ch)
        // Hem akorda hem sözde uyguluyoruz ki hizalama bozulmasın
        wordSpacing: '-0.46ch' 
      };

      if (hasChord) {
        const tokens = line.split(/(\s+|[()])/);
        const renderedLine = tokens.map((token, tIdx) => {
          if (token.match(chordRegex)) {
            const transposed = transposeChord(token.trim(), transposeStep);
            return <span key={tIdx} className="text-blue-600 font-bold" style={{wordSpacing: 'inherit'}}>{transposed}</span>;
          }
          return <span key={tIdx} className="text-gray-800" style={{wordSpacing: 'inherit'}}>{token}</span>;
        });

        return (
          <div key={idx} style={{ ...rowStyle, height: '18px', lineHeight: '18px' }}>
            {renderedLine}
          </div>
        );
      }

      return (
        <div key={idx} style={{ 
          ...rowStyle, 
          height: '24px', 
          lineHeight: '24px', 
          marginBottom: '2px',
          color: '#1f2937'
        }}>
          {line || ' '}
        </div>
      );
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-10 bg-white rounded-xl shadow-sm border border-gray-100 mt-6 mb-10">
      <div className="mb-8 border-b pb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
          <h2 className="text-xl text-gray-500 mt-1">{artist}</h2>
        </div>
        <div className="flex items-center gap-2 bg-white shadow-sm px-3 py-1.5 rounded-full border border-gray-200">
          <button onClick={() => setTransposeStep(s => s - 1)} className="p-1.5 hover:bg-gray-100 rounded-full cursor-pointer transition-colors"><Minus size={18} /></button>
          <span className="w-10 text-center font-extrabold text-blue-600">{transposeStep > 0 ? `+${transposeStep}` : transposeStep}</span>
          <button onClick={() => setTransposeStep(s => s + 1)} className="p-1.5 hover:bg-gray-100 rounded-full cursor-pointer transition-colors"><Plus size={18} /></button>
        </div>
      </div>
      <div style={{ backgroundColor: '#fff', padding: '10px', overflowX: 'auto' }}>
        <div style={{ display: 'inline-block', minWidth: '100%' }}>
            {renderContent()}
        </div>
      </div>
    </div>
  );
}
