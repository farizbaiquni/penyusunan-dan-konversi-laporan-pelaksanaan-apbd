import Image from "next/image";

interface LoadingProcessingProps {
  message: string;
}

export default function LoadingProcessing({ message }: LoadingProcessingProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm text-white">
      {/* GIF animasi */}
      <Image
        width={50}
        height={50}
        src="/animations/loading-animation.gif"
        alt="Loading animation"
        className="w-20 h-20 md:w-36 md:h-36 object-contain"
      />

      {/* Teks status */}
      <div className="text-center">
        <p className="text-lg md:text-xl font-semibold tracking-wide animate-pulse">
          {message}
        </p>
        <p className="text-sm md:text-base text-gray-200 mt-1">
          Mohon tunggu sebentar, sistem sedang memproses...
        </p>
      </div>

      {/* Progress bar semu (opsional) */}
      <div className="w-48 h-1.5 bg-white/20 rounded-full overflow-hidden mt-5">
        <div className="h-full bg-white/80 animate-[progress_2s_linear_infinite]" />
      </div>

      <style jsx>{`
        @keyframes progress {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
