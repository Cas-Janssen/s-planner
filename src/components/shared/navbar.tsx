import Link from "next/link";
import { NavbarClient } from "./navbar-client";

const Logo = (props: React.SVGAttributes<SVGElement>) => {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 324 323"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect
        x="88.1023"
        y="144.792"
        width="151.802"
        height="36.5788"
        rx="18.2894"
        transform="rotate(-38.5799 88.1023 144.792)"
        fill="currentColor"
      />
      <rect
        x="85.3459"
        y="244.537"
        width="151.802"
        height="36.5788"
        rx="18.2894"
        transform="rotate(-38.5799 85.3459 244.537)"
        fill="currentColor"
      />
    </svg>
  );
};

const navigationLinks = [
  { href: "/", label: "Home" },
  { href: "/boards", label: "Boards" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  return (
    <header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-primary hover:text-primary/70 flex items-center space-x-2 transition-colors"
          >
            <div className="text-2xl">
              <Logo />
            </div>
            <span className="hidden text-xl font-bold sm:inline-block">
              {process.env.NEXT_PUBLIC_APP_NAME}
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group text-primary bg-background hover:bg-accent hover:text-primary/70 focus:bg-accent focus:text-primary/70 relative inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors"
              >
                {link.label}
                <span className="bg-primary absolute right-0 bottom-0 left-0 h-0.5 scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
              </Link>
            ))}
          </nav>
        </div>

        <NavbarClient />
      </div>
    </header>
  );
}

export { Logo };
