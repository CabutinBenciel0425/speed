import { Link, NavLink } from "react-router-dom"
import { Mail } from "lucide-react"
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa"
import speedSmall from "@/assets/speed-sm.png"

export default function Footer() {
  return (
    <footer className="mt-20 w-full border-t bg-background py-10 md:py-16">
      <div className="container mx-auto max-w-7xl px-5">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div className="flex flex-col gap-4">
            <NavLink
              to="/"
              className="text-xl font-bold tracking-tight text-primary"
            >
              <img src={speedSmall} alt="speed" className="h-15 w-35" />
            </NavLink>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Fast, reliable delivery right to your doorstep. Bringing your
              favorite flavors to you, every day.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold tracking-wider text-foreground uppercase">
              Company
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm text-muted-foreground">
              <li>
                <Link
                  to="/about"
                  className="transition-colors hover:text-primary"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/careers"
                  className="transition-colors hover:text-primary"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  className="transition-colors hover:text-primary"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold tracking-wider text-foreground uppercase">
              Support
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm text-muted-foreground">
              <li>
                <Link
                  to="/help"
                  className="transition-colors hover:text-primary"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="transition-colors hover:text-primary"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="transition-colors hover:text-primary"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold tracking-wider text-foreground uppercase">
              Connect
            </h3>
            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-muted p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                aria-label="Facebook"
              >
                <FaFacebook className="size-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-muted p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                aria-label="Instagram"
              >
                <FaInstagram className="size-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-muted p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                aria-label="Twitter / X"
              >
                <FaTwitter className="size-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-muted p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                aria-label="Youtube"
              >
                <FaYoutube className="size-4" />
              </a>
              <a
                href="mailto:support@speed.com"
                className="rounded-full bg-muted p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                aria-label="Email"
              >
                <Mail className="size-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Speed. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link to="/terms" className="transition-colors hover:text-primary">
              Terms
            </Link>
            <Link
              to="/privacy"
              className="transition-colors hover:text-primary"
            >
              Privacy
            </Link>
            <Link
              to="/cookies"
              className="transition-colors hover:text-primary"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
