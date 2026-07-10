import { notFound } from "next/navigation";
import { DevdarianiExperience } from "@/components/devdariani-v2/DevdarianiExperience";
import { copy } from "@/lib/devdariani-v2/copy";
import { isLocale, locales, type Locale } from "@/lib/devdariani-v2/locales";

type ExperienceV2PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ debug3d?: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Pick<ExperienceV2PageProps, "params">) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  return {
    description:
      locale === "ka"
        ? "DEVDARIANI — Orchestrics™-ის ხელოვნება. Engineering the Whole."
        : "DEVDARIANI — The Art of Orchestrics™. Engineering the Whole.",
    title: "DEVDARIANI Experience V2",
  };
}

export default async function ExperienceV2Page({
  params,
  searchParams,
}: ExperienceV2PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const resolvedSearchParams = await searchParams;
  const currentLocale: Locale = locale;

  return (
    <DevdarianiExperience
      copy={copy[currentLocale]}
      debug={resolvedSearchParams.debug3d === "1"}
      locale={currentLocale}
    />
  );
}
