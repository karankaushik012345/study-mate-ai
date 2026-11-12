import React from 'react';
import { BookOpen, Lightbulb, Compass, AlertCircle } from 'lucide-react';

export function DeepDiveBlock({ deepDive, topic, title }) {
  if (!deepDive) return null;
  const sections = Array.isArray(deepDive.coreConceptsSections) ? deepDive.coreConceptsSections : [];
  const reading = Array.isArray(deepDive.furtherReadingTopics) ? deepDive.furtherReadingTopics : [];
  return (
    <section className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 shadow-sm p-5 sm:p-8 space-y-7">
      <header className="flex gap-3 items-start">
        <span className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"><BookOpen className="w-5 h-5" /></span>
        <div><p className="text-xs uppercase tracking-widest font-bold text-emerald-700 dark:text-emerald-300">Deep dive · {topic}</p><h3 className="text-xl sm:text-2xl font-extrabold mt-1">Understand {title}</h3></div>
      </header>
      {deepDive.introduction && <p className="text-sm sm:text-base leading-7 text-zinc-600 dark:text-zinc-300">{deepDive.introduction}</p>}
      {sections.length > 0 && <div className="grid md:grid-cols-2 gap-4">{sections.map((section, index) => <article key={`${section.heading}-${index}`} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 bg-zinc-50/70 dark:bg-zinc-950/40"><span className="text-xs font-bold text-emerald-600">0{index + 1}</span><h4 className="font-bold text-zinc-900 dark:text-zinc-100 mt-2 mb-2">{section.heading}</h4><p className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">{section.content}</p></article>)}</div>}
      {deepDive.realWorldApplications && <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30"><h4 className="font-bold flex gap-2 items-center mb-2"><Lightbulb className="w-4 h-4 text-amber-500" /> Where it shows up</h4><p className="text-sm leading-6 text-zinc-700 dark:text-zinc-300">{deepDive.realWorldApplications}</p></div>}
      {deepDive.commonMisconceptions && <div className="flex gap-3 p-4 rounded-2xl border border-amber-200 dark:border-amber-900"><AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0"/><p className="text-sm leading-6 text-zinc-600 dark:text-zinc-300"><strong className="text-zinc-900 dark:text-zinc-100">Common misconceptions: </strong>{deepDive.commonMisconceptions}</p></div>}
      {reading.length > 0 && <div><h4 className="font-bold flex gap-2 items-center mb-3"><Compass className="w-4 h-4 text-teal-600"/> Keep exploring</h4><div className="flex flex-wrap gap-2">{reading.map((item, index) => <span key={`${item}-${index}`} className="px-3 py-1.5 rounded-full text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">{item}</span>)}</div></div>}
    </section>
  );
}
