import { atom, useAtomValue, useSetAtom } from "jotai";
import { Copy, CopyCheck, Share2Icon, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { SubmitAtom, urlsAtom } from "@/lib/store";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const completedAtom = atom(false);

const char = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function fixSize(oldUrl: string, newUrl: string) {
  if (oldUrl.length > newUrl.length) {
    return [oldUrl, newUrl.padEnd(oldUrl.length, " ")];
  } else {
    return [oldUrl.padEnd(newUrl.length, " "), newUrl];
  }
}

function AnimateURL({ oldurl, newurl }: { oldurl: string; newurl: string }) {
  const [oldURL, newURL] = fixSize(oldurl, newurl);
  let [url, setURL] = useState(oldURL);
  let count = useRef(0);
  let index = useRef(0);

  const setCompleted = useSetAtom(completedAtom);

  useEffect(() => {
    let decrytTimeout: NodeJS.Timeout;

    function calculateInterval(length: number) {
      const baseTime = 2000; // 2 seconds in milliseconds
      return baseTime / length;
    }

    const intervalTime = calculateInterval(newURL.length);

    const initTimeout = () =>
      setInterval(() => {
        setURL((u) => {
          let g = u.split("");
          if (!g[index.current]) {
            clearInterval(decrytTimeout);
            setTimeout(() => setCompleted(true), 100);
          }
          index.current = index.current + 1;
          return (
            newURL.slice(0, index.current - 1) +
            g.join("").slice(index.current - 1)
          );
        });
      }, intervalTime);

    let encrytTimeout = setInterval(() => {
      setURL((u) => {
        let g = u.split("");
        if (count.current === newURL.length) {
          clearInterval(encrytTimeout);
          decrytTimeout = initTimeout();
        }
        count.current = count.current + 1;
        return g
          .map((e, i) =>
            i == count.current
              ? char[Math.floor(Math.random() * char.length)]
              : e
          )
          .join("");
      });
    }, intervalTime);

    return () => {
      clearInterval(encrytTimeout);
      clearInterval(decrytTimeout);
    };
  }, []);

  return url.trim();
}

function AnimateURLWrapper() {
  const [oldurl, newurl] = useAtomValue(urlsAtom);
  const [start, setStart] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setStart(true), 1000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="md:text-3xl text-2xl">
      {start ? (
        <HoverCard openDelay={400}>
          <HoverCardTrigger asChild>
            <a href={newurl} target="_blank" className="underline w-fit">
              <AnimateURL oldurl={oldurl} newurl={newurl} />
            </a>
          </HoverCardTrigger>
          <HoverCardContent
            side="top"
            className="w-fit bg-zinc-950 text-slate-200 text-sm border-zinc-600"
          >
            {oldurl}
          </HoverCardContent>
        </HoverCard>
      ) : (
        oldurl
      )}
    </div>
  );
}

const AnimateSlideFade = {
  initial: { y: "100%", opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: "100%", opacity: 0 },
};

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

function CopyButton() {
  const [copied, setCopied] = useState(false);
  const ConyMotion = motion(Copy);
  const ConyCheckMotion = motion(CopyCheck);

  const [, newurl] = useAtomValue(urlsAtom);

  return (
    <div className="relative">
      <AnimatePresence>
        {!copied ? (
          <ConyMotion
            variants={fadeIn}
            initial="initial"
            animate="animate"
            size={30}
            className="mt-2 ml-4"
            onClick={() => {
              navigator.clipboard.writeText(newurl);
              setCopied(true);
              setTimeout(() => setCopied(false), 1000);
            }}
          />
        ) : (
          <>
            <div className="absolute left-1/2 -translate-x-1/2 ml-1 text-sm -translate-y-6">
              Copied
            </div>
            <ConyCheckMotion
              variants={fadeIn}
              initial="initial"
              animate="animate"
              size={30}
              className="mt-2 ml-4"
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function WindowInner() {
  const isCompleted = useAtomValue(completedAtom);

  const setSubmitted = useSetAtom(SubmitAtom);

  const newURL = useAtomValue(urlsAtom)[1];

  return (
    <motion.div
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      initial={{ opacity: 0 }}
      className="w-screen min-h-screen bg-zinc-950 flex justify-center items-center text-slate-300"
    >
      <div className="max-w-[500px] w-full max-h-screen relative h-screen md:h-[500px] flex justify-center items-center">
        <button
          className="absolute inset-6 border-2 w-fit h-fit p-1 rounded-full"
          onClick={() => setSubmitted(false)}
        >
          <div className="w-full h-full relative">
            <X size={30} />
            <div className="absolute top-1/2 -translate-y-1/2 translate-x-full ml-5">
              ESC
            </div>
          </div>
        </button>
        <motion.div layout className="grid grid-cols-1 gap-y-3">
          <div className="flex items-end justify-center">
            <MotionConfig transition={{ duration: 0.5, ease: "easeInOut" }}>
              <AnimatePresence mode="wait">
                {isCompleted ? (
                  <motion.div
                    variants={AnimateSlideFade}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    Short URL
                  </motion.div>
                ) : (
                  <motion.div
                    variants={AnimateSlideFade}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    Creating short url...
                  </motion.div>
                )}
              </AnimatePresence>
            </MotionConfig>
          </div>
          <div className="row-span-1 text-center md:px-0 px-4 w-full break-all flex justify-center items-center text-pretty">
            <AnimateURLWrapper />
            {isCompleted && <CopyButton />}
          </div>
          <div className="flex justify-center items-center">
            {isCompleted && (
              <button
                onClick={async () => {
                  if (!navigator.share) return;
                  try {
                    // Use the Web Share API to trigger the native sharing dialog
                    await navigator.share({
                      title: "Share Short URLs with friends",
                      text: "Check out this awesome Short URL!",
                      url: newURL,
                    });

                    console.log("Shared successfully");
                  } catch (error) {
                    console.error("Error sharing:", error);
                  }
                }}
                className="bg-slate-400/10 text-slate-200 px-8 py-2 rounded-md w-fit space-x-2 flex"
              >
                <div>Share</div>
                <Share2Icon size={20} className="inline-block mt-1" />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function Window() {
  const setCompleted = useSetAtom(completedAtom);
  useEffect(() => {
    setCompleted(() => false);
  });
  return <WindowInner />;
}
