import { Dialogo, ConteudoDialogo } from '@/components/ui/dialogo';
import { Botao } from '@/components/ui/botao';
import { Award, Download } from 'lucide-react';
import jsPDF from 'jspdf';

export function CertificateViewDialog({ open, onOpenChange, badge, userName }) {
  if (!badge) return null;

  const handleDownloadPDF = async () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    doc.setFillColor(16, 185, 129);
    doc.rect(0, 0, 297, 210, 'F');
    
    doc.setFillColor(255, 255, 255);
    doc.rect(15, 15, 267, 180, 'F');

    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(3);
    doc.rect(15, 15, 267, 180);
    
    doc.setDrawColor(34, 197, 94);
    doc.setLineWidth(1);
    doc.line(25, 25, 272, 25);
    doc.line(25, 185, 272, 185);

    doc.setFontSize(36);
    doc.setTextColor(16, 185, 129);
    doc.setFont('helvetica', 'bold');
    doc.text('CERTIFICADO DE CONQUISTA', 148.5, 45, { align: 'center' });

    doc.setFontSize(16);
    doc.setTextColor(34, 197, 94);
    doc.setFont('helvetica', 'normal');
    doc.text('Ponto Orgânico - Grupo +Verde', 148.5, 55, { align: 'center' });

    doc.setDrawColor(34, 197, 94);
    doc.setLineWidth(1);
    doc.line(60, 65, 237, 65);

    doc.setFontSize(18);
    doc.setTextColor(75, 85, 99);
    doc.setFont('helvetica', 'normal');
    doc.text('Certificamos que', 148.5, 85, { align: 'center' });

    doc.setFontSize(28);
    doc.setTextColor(16, 185, 129);
    doc.setFont('helvetica', 'bold');
    doc.text(userName, 148.5, 100, { align: 'center' });

    doc.setFontSize(18);
    doc.setTextColor(75, 85, 99);
    doc.setFont('helvetica', 'normal');
    doc.text('conquistou o certificado', 148.5, 115, { align: 'center' });

    doc.setFontSize(24);
    doc.setTextColor(16, 185, 129);
    doc.setFont('helvetica', 'bold');
    const badgeNameLines = doc.splitTextToSize(badge.nome, 200);
    doc.text(badgeNameLines, 148.5, 130, { align: 'center' });

    doc.setFontSize(13);
    doc.setTextColor(107, 114, 128);
    doc.setFont('helvetica', 'italic');
    const description = doc.splitTextToSize(badge.descrição, 220);
    doc.text(description, 148.5, 145, { align: 'center' });

    doc.setFontSize(11);
    doc.setTextColor(75, 85, 99);
    doc.setFont('helvetica', 'normal');
    doc.text(`Data de emissão: ${new Date().toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    })}`, 148.5, 175, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text('Validado por: Ponto Orgânico - Grupo +Verde', 148.5, 182, { align: 'center' });

    doc.setFontSize(8);
    doc.setTextColor(200, 200, 200);
    doc.text(`ID: ${Date.now().toString(36).toUpperCase()}`, 148.5, 190, { align: 'center' });

    try {
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      
      await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.warn('Timeout ao carregar logo');
          resolve();
        }, 2000);
        
        logoImg.onload = () => {
          clearTimeout(timeout);
          try {
            const canvas = document.createElement('canvas');
            const maxSize = 200;
            let width = logoImg.width;
            let height = logoImg.height;
            
            if (width > maxSize || height > maxSize) {
              if (width > height) {
                height = (height * maxSize) / width;
                width = maxSize;
              } else {
                width = (width * maxSize) / height;
                height = maxSize;
              }
            }
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(logoImg, 0, 0, width, height);
            const logoDataUrl = canvas.toDataURL('image/png');
            
            doc.addImage(logoDataUrl, 'PNG', 240, 25, 45, 45);
            resolve();
          } catch (error) {
            console.warn('Erro ao processar logo:', error);
            resolve();
          }
        };
        
        logoImg.onerror = () => {
          clearTimeout(timeout);
          console.warn('Logo não encontrado');
          resolve();
        };
        
        logoImg.src = '/logo-+verde.png';
      });
    } catch (error) {
      console.warn('Erro ao carregar logo:', error);
    }

    doc.save(`certificado-${badge.nome.toLowerCase().replace(/\s+/g, '-')}.pdf`);
  };

  return (
    <Dialogo open={open} onOpenChange={onOpenChange}>
      <ConteudoDialogo className="max-w-3xl p-0">
        <div className="relative bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 p-8 rounded-lg border-4 border-green-600 shadow-2xl">
          <div className="absolute top-4 right-4">
            <img 
              src="/logo-+verde.png" 
              alt="Logo Ponto Orgânico" 
              className="w-24 h-24 object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>

          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-full p-6 shadow-lg">
                <Award className="w-16 h-16 text-white" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                CERTIFICADO DE CONQUISTA
              </h2>
              <p className="text-lg font-semibold text-green-700">Ponto Orgânico - Grupo +Verde</p>
              <div className="flex items-center justify-center gap-2">
                <div className="h-px w-20 bg-gradient-to-r from-transparent to-green-400"></div>
                <div className="h-px w-20 bg-gradient-to-l from-transparent to-green-400"></div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-xl border-2 border-green-200">
              <p className="text-xl text-gray-700 mb-4 font-medium">Certificamos que</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent mb-4">
                {userName}
              </p>
              <p className="text-xl text-gray-700 mb-2 font-medium">conquistou o certificado</p>
              <div className="my-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-300">
                <p className="text-2xl font-bold text-green-700 mb-2">{badge.nome}</p>
                <p className="text-sm text-gray-600 italic">{badge.descrição}</p>
              </div>
            </div>

            <div className="border-t-2 border-green-300 pt-4 space-y-2">
              <p className="text-sm font-medium text-gray-700">
                Data de emissão: <span className="text-green-700">{new Date().toLocaleDateString('pt-BR', { 
                  day: '2-digit', 
                  month: 'long', 
                  year: 'numeric' 
                })}</span>
              </p>
              <p className="text-xs text-gray-500">
                Validado por: Ponto Orgânico - Grupo +Verde
              </p>
            </div>

            <div className="flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full">
                <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse"></div>
                <span className="font-medium text-green-700">Autêntico</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-full">
                <div className="w-3 h-3 bg-emerald-600 rounded-full"></div>
                <span className="font-medium text-emerald-700">Verificado</span>
              </div>
            </div>

            <Botao 
              onClick={handleDownloadPDF}
              className="mt-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 w-full shadow-lg"
              size="lg"
            >
              <Download className="w-5 h-5 mr-2" />
              Baixar Certificado em PDF
            </Botao>
          </div>
        </div>
      </ConteudoDialogo>
    </Dialogo>
  );
}
