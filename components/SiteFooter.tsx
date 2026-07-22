import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer>
      <Image src="/retech-logo-transparent.png" alt="RETECH Digital Solution" width={500} height={430} />
      <p>PT. Retech Digital Solution<br />IT solutions that move business forward.</p>
      <div>
        <Link href="/services">Services</Link>
        <Link href="/work">Case Studies</Link>
        <Link href="/pricing">Pricing</Link>
        <Link href="/faq">FAQ</Link>
        <Link href="/#approach">Approach</Link>
        <a href="mailto:sales@retech.id">Email</a>
      </div>
      <small>© {new Date().getFullYear()} RETECH. All rights reserved.</small>
    </footer>
  );
}
