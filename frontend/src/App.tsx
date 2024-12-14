import { useEffect, useRef } from "react";
import "./App.css";
import Window from "./components/Window";
import { AnimatePresence, motion } from "motion/react";
import { useAtomValue, useSetAtom } from "jotai";
import { SubmitAtom, urlsAtom } from "./lib/store";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function AddURL() {
  const InputRef = useRef<HTMLTextAreaElement>(null);

  const setSubmitted = useSetAtom(SubmitAtom);

  const SetURLs = useSetAtom(urlsAtom);

  useEffect(() => {
    window.addEventListener("keydown", () => {
      const isFocused = InputRef.current === document.activeElement;
      if (!isFocused) return InputRef?.current?.focus();
    });
  }, []);

  return (
    <motion.div
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      initial={{ opacity: 0 }}
      className="w-full min-h-screen flex flex-col items-center justify-center space-y-6 bg-zinc-950 text-slate-200"
    >
      <p className="pointer-events-none select-none text-4xl font-bold text-center max-w-[400px] -mt-4">
        Shorten URLs <span className="text-base">&</span>
        <br /> Direct App Access
      </p>
      <p>Enter the URL below: </p>
      <form
        action=""
        className="flex flex-col w-fit justify-center items-center space-y-4"
        onSubmit={() => console.log}
      >
        <p className="w-full px-2">
          <textarea
            className="w-full resize-none border-b md:border-b-0 text-center focus:placeholder:text-transparent focus:caret-inherit caret-transparent block bg-transparent outline-none text-4xl px-4 py-6 h-full mx-auto max-w-[500px]"
            placeholder="Start Typing..."
            rows={1}
            ref={InputRef}
            onInput={function (e) {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = target.scrollHeight + "px";

              if (target.value.includes("\n")) {
                target.value = target.value.replace("\n", "");
              }
            }}
          ></textarea>
        </p>
        <button
          className="bg-slate-400/10 text-slate-200 px-8 py-2 rounded-md"
          onClick={() => {
            SetURLs([
              InputRef.current?.value.trim() || "",
              "http://localhost:3000",
            ]);
            setSubmitted(true);
          }}
        >
          Convert
        </button>
      </form>
    </motion.div>
  );
}

function Main() {
  const isSubmitted = useAtomValue(SubmitAtom);

  return (
    <AnimatePresence>{isSubmitted ? <Window /> : <AddURL />}</AnimatePresence>
  );
}

function App() {
  return (
    <>
      <Main />
      <div className="absolute bottom-0 right-0 text-slate-300 m-8 mx-10 text-right">
        <div>
          Created by{" "}
          <a className="underline" href="">
            Mrinmoy Mondal
          </a>
        </div>
        <AlertDialog>
          <AlertDialogTrigger className="underline decoration-slate-500">
            Usage Policy
          </AlertDialogTrigger>
          <AlertDialogContent className="dark">
            <AlertDialogHeader className="text-slate-200">
              <AlertDialogTitle>Usage Policy</AlertDialogTitle>
              <AlertDialogDescription>
                <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
                  <li>Shorten URL only works for 72hrs</li>
                  <li>Each User is limited to 5 short url per day.</li>
                  <li>This App is developed by Mrinmoy Mondal</li>
                </ul>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction>Close</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}

export default App;
