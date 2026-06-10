import { useEffect, useState } from "react";

import { adminEmail, isSupabaseConfigured, supabase } from "../lib/supabase";

const adminSections = [
  "Projects",
  "Hero & About",
  "Skills",
  "Experience",
  "Education",
  "Achievements",
  "Resume & Profile Photo",
];

const AdminApp = () => {
  const [email, setEmail] = useState(adminEmail);
  const [password, setPassword] = useState("");
  const [sessionUser, setSessionUser] = useState(null);
  const [authStatus, setAuthStatus] = useState(
    isSupabaseConfigured ? "checking" : "missing-config",
  );
  const [authError, setAuthError] = useState("");

  const enforceAdminSession = async (user) => {
    if (!user) {
      setSessionUser(null);
      setAuthStatus("signed-out");
      return;
    }

    if (user.email !== adminEmail) {
      await supabase.auth.signOut();
      setSessionUser(null);
      setAuthError("Not authorized");
      setAuthStatus("signed-out");
      return;
    }

    setSessionUser(user);
    setAuthError("");
    setAuthStatus("signed-in");
  };

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      return undefined;
    }

    let isMounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!isMounted) {
        return;
      }

      if (error) {
        setAuthError(error.message);
        setAuthStatus("signed-out");
        return;
      }

      enforceAdminSession(data.session?.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) {
        return;
      }

      enforceAdminSession(session?.user);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSignIn = async (event) => {
    event.preventDefault();
    setAuthError("");
    setAuthStatus("loading");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAuthError(error.message);
      setAuthStatus("signed-out");
      return;
    }

    await enforceAdminSession(data.user);
  };

  const handleLogout = async () => {
    setAuthError("");
    setAuthStatus("loading");
    await supabase.auth.signOut();
    setPassword("");
    setSessionUser(null);
    setAuthStatus("signed-out");
  };

  if (!isSupabaseConfigured) {
    return (
      <main className="min-h-screen bg-white px-6 py-8 font-poppins text-primary sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-2xl rounded-lg border border-[#163269]/10 bg-white p-6 shadow-[0_20px_100px_-40px_rgba(22,50,105,0.3)]">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-secondary">
            Admin Dashboard
          </p>
          <h1 className="mt-3 text-3xl font-normal tracking-tight text-primary">
            Raafid Portfolio Admin
          </h1>
          <p className="mt-4 text-sm font-light leading-6 text-[#4a5568]">
            Supabase is not configured. Add VITE_SUPABASE_URL and
            VITE_SUPABASE_ANON_KEY.
          </p>
        </div>
      </main>
    );
  }

  if (authStatus === "checking") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6 font-poppins text-primary">
        <p className="text-sm font-light text-[#4a5568]">
          Checking admin session...
        </p>
      </main>
    );
  }

  if (authStatus !== "signed-in") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6 py-8 font-poppins text-primary">
        <form
          className="w-full max-w-md rounded-lg border border-[#163269]/10 bg-white p-6 shadow-[0_20px_100px_-40px_rgba(22,50,105,0.3)]"
          onSubmit={handleSignIn}
        >
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-secondary">
            Admin Login
          </p>
          <h1 className="mt-3 text-3xl font-normal tracking-tight text-primary">
            Raafid Portfolio Admin
          </h1>
          <p className="mt-3 text-sm font-light leading-6 text-[#4a5568]">
            Sign in with the configured Supabase admin account.
          </p>

          <label className="mt-6 block text-sm font-medium text-primary">
            Email
            <input
              className="mt-2 w-full rounded-lg border border-[#163269]/10 px-4 py-3 text-sm font-light text-primary outline-none transition focus:border-[#31c0f4]"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>

          <label className="mt-4 block text-sm font-medium text-primary">
            Password
            <input
              className="mt-2 w-full rounded-lg border border-[#163269]/10 px-4 py-3 text-sm font-light text-primary outline-none transition focus:border-[#31c0f4]"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>

          {authError ? (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-light text-red-700">
              {authError}
            </p>
          ) : null}

          <button
            className="mt-6 w-full rounded-lg bg-gradient-to-r from-[#31c0f4] to-[#163269] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={authStatus === "loading"}
            type="submit"
          >
            {authStatus === "loading" ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-6 py-8 font-poppins text-primary sm:px-10 lg:px-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-6 border-b border-[#163269]/10 pb-8 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.18em] text-secondary">
              Admin Dashboard
            </p>
            <h1 className="text-3xl font-normal tracking-tight text-primary sm:text-4xl">
              Raafid Portfolio Admin
            </h1>
            <p className="mt-4 max-w-2xl text-base font-light leading-7 text-[#4a5568]">
              Manage portfolio content, projects, resume, and profile assets.
            </p>
          </div>

          <button
            className="w-fit rounded-lg border border-[#163269]/10 px-4 py-2 text-sm font-medium text-primary transition hover:border-[#31c0f4]/50 hover:text-secondary"
            onClick={handleLogout}
            type="button"
          >
            Logout
          </button>
        </header>

        <section className="rounded-lg border border-[#31c0f4]/40 bg-[#31c0f4]/5 p-5 shadow-[0_20px_100px_-40px_rgba(22,50,105,0.3)]">
          <p className="text-sm font-medium text-secondary">Status</p>
          <h2 className="mt-2 text-xl font-normal text-primary">
            Admin foundation ready
          </h2>
          <p className="mt-2 text-sm font-light leading-6 text-[#4a5568]">
            Hostname routing is in place. Content editing, authentication, and
            storage will be added in later steps.
          </p>
          <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-medium text-primary">Logged in email</dt>
              <dd className="mt-1 font-light text-[#4a5568]">
                {sessionUser?.email}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-primary">Supabase configured</dt>
              <dd className="mt-1 font-light text-[#4a5568]">yes</dd>
            </div>
          </dl>
          <p className="mt-4 text-sm font-light text-[#4a5568]">
            CRUD editing comes in next step.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {adminSections.map((section) => (
            <article
              className="rounded-lg border border-[#163269]/10 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#31c0f4]/50 hover:shadow-lg"
              key={section}
            >
              <h2 className="text-lg font-normal text-primary">{section}</h2>
              <p className="mt-3 text-sm font-light text-[#4a5568]">
                Coming in next step
              </p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
};

export default AdminApp;
