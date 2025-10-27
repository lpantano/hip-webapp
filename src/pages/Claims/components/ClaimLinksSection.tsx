import React from 'react';

type LinkRow = {
  id: string;
  url: string;
  title?: string | null;
  description?: string | null;
};

export default function ClaimLinksSection({ links }: { links?: LinkRow[] | null }) {
  if (!links || links.length === 0) return null;

  return (
    <div className="mt-2 space-y-2">
      {links.map((link) => {
        let displayUrl = link.url;
        try {
          const urlObj = new URL(link.url);
          displayUrl = urlObj.hostname.replace(/^www\./, '');
        } catch (e) {
          // fallback to original
        }

        return (
          <div key={link.id} className="text-sm">
            Source:{' '}
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline max-w-[140px] sm:max-w-none truncate inline-block align-bottom"
              title={link.url}
            >
              {link.title || displayUrl}
            </a>
            {link.description && (
              <div className="text-xs text-muted-foreground">{link.description}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
