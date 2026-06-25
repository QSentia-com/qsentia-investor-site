import Image from 'next/image';

export function LoadingScreen({ fixed = false }: { fixed?: boolean }) {
  return (
    <div
      className={`${
        fixed ? 'fixed inset-0 z-[120]' : 'min-h-screen'
      } flex items-center justify-center overflow-hidden bg-white px-6 text-[#06130c]`}
      role="status"
      aria-live="polite"
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(61,82,218,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(61,82,218,0.055)_1px,transparent_1px)] bg-[size:70px_70px]"
      />
      <div aria-hidden className="absolute left-[12%] top-[18%] h-16 w-16 rotate-[18deg] rounded-[6px] border border-[#3d52da]/15" />
      <div aria-hidden className="absolute right-[14%] bottom-[20%] h-10 w-10 rotate-[-12deg] rounded-[5px] border border-[#3d52da]/12" />

      <div className="relative z-10 w-full max-w-md rounded-[12px] border border-[#dbe3ff] bg-white/92 p-7 text-center shadow-[0_24px_70px_rgba(23,37,84,0.14)] backdrop-blur">
        <Image
          src="/logo/qsentia-primary.png"
          alt="QSentia"
          width={138}
          height={34}
          className="mx-auto h-8 w-auto"
        />
        <div className="mt-7 text-xs font-bold uppercase tracking-[0.24em] text-[#3d52da]">
          Preparing workspace
        </div>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#5a685f]">
          Loading model telemetry, account state, and secure navigation.
        </p>
        <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-[#eef2ff]">
          <div className="h-full w-1/3 rounded-full bg-[#3d52da] [animation:qsentia-buffer-slide_1.1s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
}
