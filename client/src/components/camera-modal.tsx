import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X } from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecognize: (file: File) => Promise<any>;
}

export default function CameraModal({ isOpen, onClose, onRecognize }: CameraModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      toast({
        title: "Error de cámara",
        description: "No se pudo acceder a la cámara. Usa la opción de subir archivo.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0);
    
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      
      setIsProcessing(true);
      try {
        const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
        await onRecognize(file);
        onClose();
        toast({
          title: "¡Ingredientes reconocidos!",
          description: "Los ingredientes han sido identificados exitosamente.",
        });
      } catch (error) {
        toast({
          title: "Error de reconocimiento",
          description: "No se pudieron reconocer los ingredientes. Inténtalo de nuevo.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    }, 'image/jpeg', 0.8);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      await onRecognize(file);
      onClose();
      toast({
        title: "¡Ingredientes reconocidos!",
        description: "Los ingredientes han sido identificados exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error de reconocimiento",
        description: "No se pudieron reconocer los ingredientes. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Escanear Ingredientes
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X size={16} />
            </Button>
          </DialogTitle>
          <p className="text-sm text-slate-600">
            Toma una foto de tus ingredientes para identificarlos automáticamente
          </p>
        </DialogHeader>

        {isProcessing ? (
          <div className="text-center py-12">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">IA Analizando...</h3>
            <p className="text-slate-600">Identificando ingredientes en tu imagen</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Camera Preview */}
            <div className="bg-slate-100 rounded-lg h-64 flex items-center justify-center relative overflow-hidden">
              {cameraStream ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <Camera className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-600">Cámara lista</p>
                  <Button 
                    onClick={startCamera}
                    className="mt-2"
                    variant="outline"
                  >
                    Activar Cámara
                  </Button>
                </div>
              )}
            </div>

            {/* Hidden canvas for photo capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Action Buttons */}
            <div className="flex space-x-3">
              {cameraStream ? (
                <Button 
                  onClick={capturePhoto}
                  className="flex-1 bg-eco-primary hover:bg-eco-primary/90"
                >
                  <Camera className="mr-2" size={16} />
                  Capturar
                </Button>
              ) : (
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 bg-eco-primary hover:bg-eco-primary/90"
                >
                  <Upload className="mr-2" size={16} />
                  Subir Foto
                </Button>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
