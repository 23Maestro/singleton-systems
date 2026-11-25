// Reviewed labels for the main-folder overview. This list is the export boundary.
export const folders = [
  ['app','Website Pages','The pages and forms people open on your website.','code','Website'],
  ['components','Page Parts','Reusable buttons, cards, and sections for the website.','code','Website'],
  ['lib','Shared Helpers','The code that joins pages to records and work tools.','flow','Website'],
  ['public','Website Files','Brand marks, pictures, and other files used by the site.','box','Website'],
  ['supabase','Stored Records','Rules and changes for the records kept in Supabase.','box','Website'],
  ['convex','App Services','Code for studio projects, tasks, and video reviews.','flow','Website'],
  ['docs','Work Guides','How Singleton Systems works, with links to each area.','map','Guides & Learning'],
  ['development','Build Guides','Where each kind of software project belongs.','map','Guides & Learning'],
  ['skills','AI Skills','Saved steps the AI can use for a clear task.','flow','Guides & Learning'],
  ['plugins','AI Tool Packs','Skills and helpers grouped by the work they support.','flow','Guides & Learning'],
  ['learning-records','Learning Notes','Notes about editing knowledge and lessons learned.','plant','Guides & Learning'],
  ['lessons','Lessons','Saved examples to learn from.','plant','Guides & Learning'],
  ['tools','Work Tools','Small tools for editing, review, and daily work.','code','Tools & Checks'],
  ['scripts','Repeat Steps','Short programs that build, check, or move work forward.','receipt','Tools & Checks'],
  ['config','Work Settings','Saved rules for clients, tools, and reviews.','receipt','Tools & Checks'],
  ['tests','Checks','Checks that catch broken behavior in the code.','receipt','Tools & Checks'],
  ['sites','Review Pages','Small hosted pages for looking at work and giving feedback.','code','Tools & Checks'],
  ['videos','Video Projects','Project files for drawn scenes and motion work.','timeline','Creative Work'],
  ['remotion','Video Code','Scenes and video pieces made with code.','timeline','Creative Work'],
  ['assets','Art Files','Pictures and other files used in projects.','box','Creative Work'],
  ['reference','Reference Notes','Saved examples that help guide the work.','map','Creative Work'],
  ['email-signatures','Email Signatures','The name and contact blocks used at the end of emails.','message','Creative Work'],
  ['cavalry','Cavalry','An empty folder. Its purpose is not reviewed yet.','box','Creative Work'],
].map(([path,title,desc,icon,group])=>({path,title,desc,icon,group}));

const excluded = new Set(['node_modules','__pycache__','dist','build','out','output','tmp','test-results','_generated']);
export function includeEntry(entry) {
  return !entry.name.startsWith('.') && !excluded.has(entry.name)
    && !/(?:credential|secret|private[-_]key|token[-_]cache)/i.test(entry.name)
    && !/\.(?:pem|key|p12|pfx|env)$/i.test(entry.name)
    && !entry.isSymbolicLink() && (entry.isFile() || entry.isDirectory());
}
