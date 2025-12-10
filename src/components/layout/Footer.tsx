import { FaGithub, FaLinkedin } from "react-icons/fa";

const year = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="w-full border-t p-4 text-center text-sm">
      <div className="flex justify-center items-center p-2 gap-2">
        <a href="https://github.com/cachia36" target="_blank" rel="noreferrer">
          <FaGithub className="h-7 w-7 hover:text-foreground transition" />
        </a>

        <a href="https://linkedin.com/in/yourname" target="_blank" rel="noreferrer">
          <FaLinkedin className="h-7 w-7 hover:text-foreground transition" />
        </a>
      </div>
      © {year} Kyle Cachia. All rights reserved.
    </footer>
  )
}
