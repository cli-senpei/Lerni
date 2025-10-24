import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Mail } from "lucide-react";

const ContactUs = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="px-6 py-16 md:px-12 md:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex items-center gap-3">
            <Mail className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold text-foreground md:text-5xl">Contact Us</h1>
          </div>
          <div className="space-y-6 text-lg text-muted-foreground">
            <p>
              Have questions or feedback? We'd love to hear from you.
            </p>
            <p>
              Reach out to our team at <a href="mailto:support@lerni.com" className="text-primary hover:underline">support@lerni.com</a>
            </p>
            <p>
              We typically respond within 24 hours and are committed to helping you make the most of Lerni.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContactUs;
