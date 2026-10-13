/** Website metadata does not belong in native navigation. In particular, a
 * private appraisal's title must not opt into Handoff/Spotlight implicitly.
 * The web implementation retains its canonical and noindex metadata.
 */
export function PageMeta(_props:{title:string;description:string;path:string;noIndex?:boolean;structuredData?:Record<string,unknown>}) {
  return null;
}
