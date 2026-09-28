import { forwardRef } from "react";
import type { AnchorHTMLAttributes } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Icon } from "@iconify/react";
import { Footer, Header, type HeaderNavItem } from "@metacentrum/design-system";
// design-system CSS is imported in app.css (needs a layer() qualifier)
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ImpersonationBanner } from "@/components/common/ImpersonationBanner";
import { DataFreshnessFooter } from "@/components/layout/DataFreshnessFooter";
import { useImpersonation } from "@/contexts/ImpersonationContext";
import { ApiError } from "@/lib/generated-api/core/ApiError";

const RouterLink = forwardRef<
  HTMLAnchorElement,
  { href: string } & AnchorHTMLAttributes<HTMLAnchorElement>
>(({ href, ...rest }, ref) => <Link ref={ref} to={href} {...rest} />);
RouterLink.displayName = "RouterLink";

export function AppLayout() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { data: currentUser, isLoading, error } = useCurrentUser();
  const { impersonatedUsername } = useImpersonation();

  const isActive = (path: string) => location.pathname === path;
  const isActiveUnder = (path: string) => location.pathname.startsWith(path);

  const navItems: HeaderNavItem[] = [
    {
      label: t("pages.personalView"),
      href: "/personal-view",
      active: isActive("/personal-view"),
      icon: (
        <Icon icon="material-symbols:dashboard-outline-rounded" width={18} height={18} />
      ),
    },
    {
      label: t("pages.qsubAssembler"),
      href: "/qsub-assembler",
      active: isActive("/qsub-assembler"),
      icon: <Icon icon="oui:compute" width={18} height={18} />,
    },
    {
      label: t("pages.resourceStatus"),
      icon: (
        <Icon icon="material-symbols:ecg-heart-outline-sharp" width={18} height={18} />
      ),
      children: [
        {
          label: t("pages.machines"),
          href: "/machines",
          active: isActiveUnder("/machines"),
        },
        {
          label: t("pages.storageSpaces"),
          href: "/storage-spaces",
          active: isActiveUnder("/storage-spaces"),
        },
        {
          label: t("pages.projects"),
          href: "/projects",
          active: isActiveUnder("/projects"),
        },
        {
          label: t("pages.queues"),
          href: "/queues",
          active: isActiveUnder("/queues"),
        },
        {
          label: t("pages.jobs"),
          href: "/jobs",
          active: isActiveUnder("/jobs"),
        },
        {
          label: t("pages.users"),
          href: "/users",
          active: isActiveUnder("/users"),
        },
        {
          label: t("pages.groups"),
          href: "/groups",
          active: isActiveUnder("/groups"),
        },
      ],
    },
    {
      label: t("pages.help"),
      icon: <Icon icon="mdi:question-mark-circle-outline" width={18} height={18} />,
      children: [
        {
          label: t("pages.userSupport"),
          href: "https://www.metacentrum.cz/cs/about/user_support.html",
          external: true,
          icon: (
            <Icon
              icon="streamline-plump:customer-support-7-remix"
              width={18}
              height={18}
            />
          ),
        },
        {
          label: t("pages.documentation"),
          href: "https://docs.metacentrum.cz/en/docs/welcome",
          external: true,
          icon: (
            <Icon icon="material-symbols:docs-outline-rounded" width={18} height={18} />
          ),
        },
        {
          label: t("pages.faq"),
          href: "https://docs.metacentrum.cz/docs/support/faqs",
          external: true,
          icon: (
            <Icon icon="mdi:question-mark-circle-outline" width={18} height={18} />
          ),
        },
        {
          label: t("pages.metacentrum"),
          href: "https://www.metacentrum.cz",
          external: true,
          icon: <Icon icon="streamline-plump:web" width={18} height={18} />,
        },
      ],
    },
  ];

  const otherLanguage = i18n.language === "cs" ? "en" : "cs";

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "GET",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout failed:", err);
    }
    window.location.href = "https://login.e-infra.cz/oidc/endsession";
  };

  const isUnauthorized = error instanceof ApiError && error.status === 401;

  return (
    <div className="flex flex-col min-h-screen bg-gray-light">
      <Header
        navItems={!isLoading && !error ? navItems : []}
        linkAs={RouterLink}
        user={
          currentUser
            ? {
                firstName: currentUser.username,
                lastName: "",
                href: "https://profile.e-infra.cz",
              }
            : undefined
        }
        onLogout={currentUser ? handleLogout : undefined}
        logoutLabel={t("common.logout")}
        language={{
          label: otherLanguage.toUpperCase(),
          ariaLabel: t("language.switchLanguage"),
          onClick: () => i18n.changeLanguage(otherLanguage),
        }}
        openMenuLabel={t("common.openMenu")}
        closeMenuLabel={t("common.closeMenu")}
      />

      <main
        id="main-content"
        className="flex-1"
        style={{
          paddingTop: "var(--mc-header-height)",
          paddingBottom: impersonatedUsername ? "60px" : "0",
        }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-lg">{t("common.loading")}</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-24">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-4">
              <div className="text-red-800">
                {isUnauthorized
                  ? t("common.redirectingToLogin")
                  : `${t("common.errorLoading")} ${
                      error instanceof Error
                        ? error.message
                        : t("common.unknownError")
                    }`}
              </div>
            </div>
          </div>
        ) : (
          <Outlet />
        )}
      </main>

      <Footer info={<DataFreshnessFooter />} />
      <ImpersonationBanner />
    </div>
  );
}
