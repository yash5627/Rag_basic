"use client";
import { useSession,signIn,signOut } from "next-auth/react";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

const initialForm = {
  name: "",
  email: "",
  password: "",
};

const socialProviders = [
  { id: "google", label: "Continue with Google", svg:<svg className="w-4 h-4 me-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.037 21.998a10.313 10.313 0 0 1-7.168-3.049 9.888 9.888 0 0 1-2.868-7.118 9.947 9.947 0 0 1 3.064-6.949A10.37 10.37 0 0 1 12.212 2h.176a9.935 9.935 0 0 1 6.614 2.564L16.457 6.88a6.187 6.187 0 0 0-4.131-1.566 6.9 6.9 0 0 0-4.794 1.913 6.618 6.618 0 0 0-2.045 4.657 6.608 6.608 0 0 0 1.882 4.723 6.891 6.891 0 0 0 4.725 2.07h.143c1.41.072 2.8-.354 3.917-1.2a5.77 5.77 0 0 0 2.172-3.41l.043-.117H12.22v-3.41h9.678c.075.617.109 1.238.1 1.859-.099 5.741-4.017 9.6-9.746 9.6l-.215-.002Z" clipRule="evenodd"/></svg>},
  { id: "github", label: "Continue with GitHub" ,svg:<svg className="w-4 h-4 me-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.006 2a9.847 9.847 0 0 0-6.484 2.44 10.32 10.32 0 0 0-3.393 6.17 10.48 10.48 0 0 0 1.317 6.955 10.045 10.045 0 0 0 5.4 4.418c.504.095.683-.223.683-.494 0-.245-.01-1.052-.014-1.908-2.78.62-3.366-1.21-3.366-1.21a2.711 2.711 0 0 0-1.11-1.5c-.907-.637.07-.621.07-.621.317.044.62.163.885.346.266.183.487.426.647.71.135.253.318.476.538.655a2.079 2.079 0 0 0 2.37.196c.045-.52.27-1.006.635-1.37-2.219-.259-4.554-1.138-4.554-5.07a4.022 4.022 0 0 1 1.031-2.75 3.77 3.77 0 0 1 .096-2.713s.839-.275 2.749 1.05a9.26 9.26 0 0 1 5.004 0c1.906-1.325 2.74-1.05 2.74-1.05.37.858.406 1.828.101 2.713a4.017 4.017 0 0 1 1.029 2.75c0 3.939-2.339 4.805-4.564 5.058a2.471 2.471 0 0 1 .679 1.897c0 1.372-.012 2.477-.012 2.814 0 .272.18.592.687.492a10.05 10.05 0 0 0 5.388-4.421 10.473 10.473 0 0 0 1.313-6.948 10.32 10.32 0 0 0-3.39-6.165A9.847 9.847 0 0 0 12.007 2Z" clipRule="evenodd"/></svg>},
  { id: "linkedin", label: "Continue with LinkedIn" ,svg:<svg className="w-4 h-4 me-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M4.98 3.5C4.98 4.88 3.86 6 2.48 6S0 4.88 0 3.5 1.12 1 2.48 1 4.98 2.12 4.98 3.5zM.5 8h4v15h-4V8zm7.5 0h3.6v2.05h.05c.5-.95 1.75-1.95 3.6-1.95 3.85 0 4.55 2.55 4.55 5.85V23h-4v-7.75c0-1.85-.05-4.25-2.6-4.25-2.6 0-3 2.05-3 4.1V23h-4V8z"/></svg>
},
];

export default function Home() {
  const searchParams = useSearchParams();
  const oauthError = searchParams.get("oauthError");
  const oauthSuccess = searchParams.get("oauthSuccess");
  const oauthName = searchParams.get("name");

  const [activeTab, setActiveTab] = useState("login");
  const [loginForm, setLoginForm] = useState(initialForm);
  const [signupForm, setSignupForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: "", text: "" });
  const [isLoading, setIsLoading] = useState(false);

  const oauthStatus = useMemo(() => {
    if (oauthError) {
      return { type: "error", text: oauthError.replaceAll("+", " ") };
    }

    if (oauthSuccess) {
      return { type: "success", text: `Social login successful. Welcome ${oauthName || "back"}!` };
    }

    return null;
  }, [oauthError, oauthSuccess, oauthName]);

  const onSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setStatus({ type: "", text: "" });

    const endpoint = activeTab === "signup" ? "/api/auth/signup" : "/api/auth/login";
    const payload = activeTab === "signup" ? signupForm : loginForm;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          activeTab === "signup"
            ? payload
            : { email: payload.email, password: payload.password },
        ),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Authentication failed");
      }

      setStatus({
        type: "success",
        text: `${result.message}. Welcome ${result.user.name}!`,
      });

      if (activeTab === "signup") {
        setSignupForm(initialForm);
      } else {
        setLoginForm(initialForm);
      }
    } catch (error) {
      setStatus({
        type: "error",
        text: error instanceof Error ? error.message : "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const activeForm = activeTab === "signup" ? signupForm : loginForm;
  const setActiveForm = activeTab === "signup" ? setSignupForm : setLoginForm;

  return (
    <main className="min-h-screen bg-black p-6 text-white">
      <section className="mx-auto mt-16 w-full max-w-md rounded-2xl bg-[#0e1b29] p-8 shadow-lg">
        <h1 className="text-2xl font-semibold">Next Auth Demo</h1>
        <p className="mt-2 text-sm text-white">Login with email/password or use social login providers.</p>

        <div className="mt-6 space-y-2">
          {socialProviders.map((provider) => (
           <button
  key={provider.id}
  type="button"
  onClick={() => signIn(provider.id)}
  className="w-full rounded-md border flex justify-between items-center border-slate-300 px-4 py-2 font-medium text-white transition hover:bg-slate-50 hover:text-black"
>
  <span className="flex items-center gap-2">
    {provider.svg}
    {provider.label}
  </span>
</button>

          ))}
        </div>

        <div className="my-6 border-t border-slate-200" />

        <div className="grid grid-cols-2 gap-2  rounded-lg text-black border-2 border-black bg-slate-100 p-1">
          {[
            { key: "login", label: "Login" },
            { key: "signup", label: "Sign Up" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setActiveTab(tab.key);
                setStatus({ type: "", text: "" });
              }}
              className={`rounded-md px-4 py-2 text-sm font-medium transition  ${
                activeTab === tab.key ? "bg-black text-white" : "text-slate-600  hover:bg-slate-400"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          {activeTab === "signup" && (
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Name</span>
              <input
                type="text"
                value={activeForm.name}
                onChange={(event) =>
                  setActiveForm((previous) => ({ ...previous, name: event.target.value }))
                }
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-indigo-500 focus:ring"
              />
            </label>
          )}

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Email</span>
            <input
              type="email"
              value={activeForm.email}
              onChange={(event) =>
                setActiveForm((previous) => ({ ...previous, email: event.target.value }))
              }
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-indigo-500 focus:ring"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Password</span>
            <input
              type="password"
              value={activeForm.password}
              onChange={(event) =>
                setActiveForm((previous) => ({ ...previous, password: event.target.value }))
              }
              required
              minLength={6}
              className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-indigo-500 focus:ring"
            />
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "Please wait..." : activeTab === "signup" ? "Create Account" : "Login"}
          </button>
        </form>

        {/* {[oauthStatus, status].filter(Boolean).map((message, index) => (
          <p
            key={`${message.type}-${index}`}
            className={`mt-4 rounded-md px-3 py-2 text-sm ${
              message.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
            }`}
          >
            {message.text}
          </p>
        ))} */}
      </section>
    </main>
  );
}