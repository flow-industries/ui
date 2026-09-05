import type * as React from "react";

import { cn } from "../../utils/cn";
import { BlueskyIcon, DiscordIcon, GitHubIcon, XIcon } from "../icons";
import { Logomark } from "../logo";
import {
  Footer,
  FooterBottom,
  FooterBrand,
  FooterContent,
  FooterCopyright,
  FooterLink,
  FooterSocials,
} from "./footer";
import { NavList, NavListGroup, NavListHeader, NavListItem } from "./nav-list";
import { StatusWidget } from "./status-widget";

const FLOW_LINKS = {
  home: "https://flow.industries",
  game: "https://flow.game",
  id: "https://id.flow.industries",
  ui: "https://ui.flow.industries",
  docs: "https://docs.flow.industries",
  status: "https://status.flow.industries",
  x: "https://x.com/flowdotgame",
  discord: "https://discord.gg/g2JXf8t4Vg",
  github: "https://github.com/flow-industries",
  bluesky: "https://bsky.app/profile/flow.industries",
} as const;

type FooterLinkItem = {
  label: React.ReactNode;
  href: string;
  external?: boolean;
};

type FlowFooterProps = React.ComponentProps<"footer"> & {
  statusApiUrl?: string;
  legalBase?: string;
  products?: FooterLinkItem[];
  resources?: FooterLinkItem[];
  legal?: FooterLinkItem[];
  year?: number;
};

const NEW_TAB_HINT = "opens in new tab";
const EXTERNAL_LINK_PROPS = {
  target: "_blank",
  rel: "noopener noreferrer",
} as const;

const socials = [
  { name: "X", href: FLOW_LINKS.x, Icon: XIcon, icon: "size-4" },
  {
    name: "Discord",
    href: FLOW_LINKS.discord,
    Icon: DiscordIcon,
    icon: "size-5",
  },
  { name: "GitHub", href: FLOW_LINKS.github, Icon: GitHubIcon, icon: "size-4" },
  {
    name: "Bluesky",
    href: FLOW_LINKS.bluesky,
    Icon: BlueskyIcon,
    icon: "size-4",
  },
] as const;

const defaultProducts: FooterLinkItem[] = [
  {
    label: <Logomark size="default" start="Flow" end="Game" />,
    href: FLOW_LINKS.game,
  },
  {
    label: <Logomark size="default" start="Flow" end="ID" />,
    href: FLOW_LINKS.id,
  },
  {
    label: <Logomark size="default" start="Flow" end="UI" />,
    href: FLOW_LINKS.ui,
  },
];

const defaultResources: FooterLinkItem[] = [
  { label: "Status", href: FLOW_LINKS.status },
  { label: "GitHub", href: FLOW_LINKS.github, external: true },
  { label: "Discord", href: FLOW_LINKS.discord, external: true },
];

function FooterGroup({
  title,
  items,
}: {
  title: string;
  items: FooterLinkItem[];
}) {
  return (
    <NavListGroup>
      <NavListHeader>{title}</NavListHeader>
      {items.map(({ label, href, external }) => (
        <NavListItem
          key={href}
          href={href}
          {...(external ? EXTERNAL_LINK_PROPS : {})}
        >
          {label}
          {external && <span className="sr-only"> ({NEW_TAB_HINT})</span>}
        </NavListItem>
      ))}
    </NavListGroup>
  );
}

/**
 * The canonical Flow footer: Products / Resources / Legal link groups, the Flow Industries brand,
 * social links, copyright and the live status pill. Every consumer renders this one composition;
 * pass `className` for margins and max-width, and the list props to swap a group's items.
 */
function FlowFooter({
  className,
  statusApiUrl,
  legalBase = FLOW_LINKS.home,
  products = defaultProducts,
  resources = defaultResources,
  legal,
  year = new Date().getFullYear(),
  ...props
}: FlowFooterProps) {
  const legalItems = legal ?? [
    { label: "Terms", href: `${legalBase}/terms` },
    { label: "Privacy", href: `${legalBase}/privacy` },
  ];

  return (
    <Footer
      data-slot="flow-footer"
      className={cn("rounded-xl bg-secondary p-8", className)}
      {...props}
    >
      <FooterContent>
        <NavList aria-label="Footer" className="w-full justify-between">
          <FooterGroup title="Products" items={products} />
          <FooterGroup title="Resources" items={resources} />
          <FooterGroup title="Legal" items={legalItems} />
        </NavList>
      </FooterContent>
      <FooterBottom className="flex-col items-start gap-4">
        <div className="flex w-full flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <FooterBrand>
            <FooterLink
              href={FLOW_LINKS.home}
              className="pointer-coarse:min-h-11 hover:text-foreground"
            >
              <Logomark size="lg" start="Flow" end="Industries" />
            </FooterLink>
          </FooterBrand>
          <FooterSocials>
            {socials.map(({ name, href, Icon, icon }) => (
              <FooterLink
                key={name}
                href={href}
                {...EXTERNAL_LINK_PROPS}
                aria-label={`Flow on ${name} (${NEW_TAB_HINT})`}
                className="-m-1 size-6 items-center justify-center pointer-coarse:m-0 pointer-coarse:size-11"
              >
                <Icon className={icon} aria-hidden="true" />
              </FooterLink>
            ))}
          </FooterSocials>
        </div>
        <div className="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <FooterCopyright>&copy; {year} Flow Industries</FooterCopyright>
          <StatusWidget apiUrl={statusApiUrl} />
        </div>
      </FooterBottom>
    </Footer>
  );
}

export type { FlowFooterProps, FooterLinkItem };
export { FLOW_LINKS, FlowFooter };
