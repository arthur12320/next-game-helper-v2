"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  BookOpen,
  Calendar,
  ChevronRight,
  Dice6,
  Map,
  MessageSquare,
  Scroll,
  Sword,
  Users,
} from "lucide-react";
import { signIn, useSession } from "next-auth/react"; // Adjust based on your auth setup
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [, setIsScrolled] = useState(false);

  // Check if user is logged in client-side and redirect if needed
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push("/campaigns");
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [session, status, router]);

  // If still checking auth status, show minimal loading state
  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/campaigns" });
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}

      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background z-0"></div>
        <div className=" relative z-10 flex flex-col items-center justify-center py-24 text-center lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              Play Legendary <span className="text-primary">RPG Campaigns</span>
            </h1>
            <p className="mb-8 text-xl text-muted-foreground">
              The ultimate toolkit for game masters to create, manage, and run
              immersive tabletop RPG adventures.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button
              onClick={handleGoogleSignIn}
              size="lg"
              className="h-12 px-8 text-lg"
            >
              Start Your Adventure
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-16 w-full max-w-5xl rounded-lg border bg-card/50 shadow-xl backdrop-blur-sm"
          >
            <Image
              src="/image.png"
              width={1200}
              height={800}
              alt="Campaign dashboard preview"
              className="rounded-lg"
              priority
            />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/30 py-20 px-6 md:px-10">
        <div className="">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything You Need For Epic Campaigns
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Powerful tools designed specifically for game masters to create
              unforgettable adventures.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 md:px-10 ">
        <div className="">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Trusted by Game Masters
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Join thousands of GMs who have elevated their campaigns with our
              tools.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="rounded-lg border bg-card p-6 shadow-sm"
              >
                <div className="mb-4 flex items-center space-x-4">
                  <div className="h-12 w-12 overflow-hidden rounded-full bg-primary/10">
                    <Image
                      src={`/placeholder.svg?height=48&width=48&text=${testimonial.name.charAt(
                        0
                      )}`}
                      width={48}
                      height={48}
                      alt={testimonial.name}
                    />
                  </div>
                  <div>
                    <p className="font-medium">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <p className="italic text-muted-foreground">
                  {'"' + testimonial.text + '"'}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-muted/30 py-20 px-6 md:px-10">
        <div className="">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Everything you need to know about CampaignForge.
            </p>
          </div>

          <div className="mx-auto max-w-3xl divide-y rounded-lg border bg-card">
            {faqs.map((faq, index) => (
              <div key={index} className="p-6">
                <h3 className="mb-2 text-lg font-medium">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-background z-0"></div>
        <div className=" relative z-10">
          <div className="mx-auto max-w-3xl rounded-lg border bg-card p-8 text-center shadow-lg">
            <Scroll className="mx-auto mb-4 h-12 w-12 text-primary" />
            <h2 className="mb-4 text-3xl font-bold tracking-tight">
              Ready to Begin Your Journey?
            </h2>
            <p className="mb-6 text-muted-foreground">
              Join thousands of game masters creating unforgettable adventures
              today.
            </p>
            <Button
              onClick={handleGoogleSignIn}
              size="lg"
              className="h-12 px-8 text-lg"
            >
              Sign in with Google
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8 px-6 md:px-10">
        <div className=" flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Dice6 className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">CES RPG Helper</span>
          </div>
          <div className="flex gap-6">
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Terms
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Contact
            </Link>
          </div>
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} CES RPG Helper. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

// Data
const features = [
  {
    icon: <Map className="h-6 w-6" />,
    title: "Interactive Maps  -- TBD",
    description:
      "Create and share detailed maps with your players, complete with fog of war and secret locations.",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Character Management -- TBD",
    description:
      "Track character stats, inventory, and development throughout your campaign.",
  },
  {
    icon: <MessageSquare className="h-6 w-6" />,
    title: "Session Notes",
    description:
      "Keep organized notes for each session and share recaps with your players.",
  },
  {
    icon: <Sword className="h-6 w-6" />,
    title: "Combat Tracker -- TBD",
    description:
      "Manage initiative, health, and conditions for smooth combat encounters.",
  },
  {
    icon: <BookOpen className="h-6 w-6" />,
    title: "Story Builder",
    description:
      "Craft compelling narratives with our intuitive story development tools.",
  },
  {
    icon: <Calendar className="h-6 w-6" />,
    title: "Session Scheduler -- TBD",
    description:
      "Coordinate game sessions with your players and send automatic reminders.",
  },
];

const testimonials = [
  {
    name: "Alex Morgan",
    role: "Dungeon Master, 5+ years",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam accumsan nibh vel faucibus aliquet. Morbi facilisis sed felis non auctor.",
  },
  {
    name: "Sarah Chen",
    role: "Pathfinder GM",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse tincidunt nunc lorem, vitae pretium nunc tempor dictum. Nunc iaculis est.",
  },
  {
    name: "Marcus Johnson",
    role: "New Game Master",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a ultrices diam, sed ultricies lectus. Nullam ultrices ex metus, at.",
  },
];

const faqs = [
  {
    question: "Is CES RPG Helper free to use?",
    answer:
      "CES RPG Helper offers a free tier with core features for individual GMs. Premium features for advanced campaign management and team collaboration are available with paid subscriptions.",
  },
  {
    question: "Which RPG systems are supported?",
    answer:
      "CES RPG Helper is system-agnostic and works with any tabletop RPG including D&D, Pathfinder, Call of Cthulhu, and many more. We provide specialized templates for popular systems.",
  },
  {
    question: "Can my players access the campaign information?",
    answer:
      "Yes! You can selectively share maps, notes, and character information with your players while keeping GM-only content private.",
  },
  {
    question: "Are all the questions in this session false?",
    answer: "Yes!",
  },
];
