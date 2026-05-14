import { useState } from "react";
import { PublicNavbar } from "@/components/public-navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { FileText, ScrollText, Shield, ChevronDown, ChevronUp } from "lucide-react";

const YELLOW = "#F5A623";

interface LegalDoc {
  id: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  color: string;
  iconColor: string;
  updatedAt: string;
  sections: { heading: string; content: string }[];
}

const DOCS: LegalDoc[] = [
  {
    id: "mentions",
    icon: FileText,
    title: "Mentions légales",
    subtitle: "Informations légales sur l'éditeur et l'hébergement du site.",
    color: "#EDE7F6",
    iconColor: "#4527A0",
    updatedAt: "Mai 2025",
    sections: [
      {
        heading: "Éditeur du site",
        content:
          "Le site www.bloq5.com est édité par BLOQ5 INC., société par actions immatriculée au Registre des entreprises du Québec (REQ) sous le numéro 1234567890, dont le siège social est situé au 3560 rue Saint-Laurent, Suite 200, Montréal, Québec H2X 2V1, Canada.\n\nDirecteur de la publication : Archange Ponke Song, Président-directeur général.\n\nContact : support@bloq5.com",
      },
      {
        heading: "Hébergement",
        content:
          "Le site est hébergé par DigitalOcean LLC, 101 Avenue of the Americas, 10th Floor, New York, NY 10013, États-Unis (www.digitalocean.com).",
      },
      {
        heading: "Propriété intellectuelle",
        content:
          "L'ensemble des contenus figurant sur le site (textes, images, graphismes, logo, icônes, sons, logiciels, etc.) constitue des œuvres au sens des lois sur la propriété intellectuelle et sont la propriété exclusive de BLOQ5 INC. ou de ses partenaires.\n\nToute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sauf autorisation écrite préalable de BLOQ5 INC.",
      },
      {
        heading: "Données personnelles",
        content:
          "BLOQ5 INC. traite vos données personnelles conformément à la Loi 25 sur la protection des renseignements personnels dans le secteur privé (Québec) et au Règlement général sur la protection des données (RGPD) pour les utilisateurs résidant en France.\n\nPour exercer vos droits (accès, rectification, suppression, portabilité), contactez-nous à : support@bloq5.com.",
      },
      {
        heading: "Cookies",
        content:
          "Le site utilise des cookies techniques nécessaires à son fonctionnement, ainsi que des cookies analytiques (pseudonymisés) pour mesurer l'audience. Vous pouvez paramétrer votre navigateur pour refuser les cookies, mais certaines fonctionnalités du site pourraient en être affectées.",
      },
      {
        heading: "Limitation de responsabilité",
        content:
          "BLOQ5 INC. s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur le site, mais ne peut garantir l'exhaustivité ou l'absence d'erreur. BLOQ5 INC. décline toute responsabilité pour tout dommage résultant de l'utilisation du site ou de l'impossibilité d'y accéder.",
      },
    ],
  },
  {
    id: "cgu",
    icon: ScrollText,
    title: "Conditions Générales d'Utilisation",
    subtitle: "Règles d'utilisation de la plateforme BLOQ5 par ses utilisateurs.",
    color: "#E3F2FD",
    iconColor: "#1565C0",
    updatedAt: "Mai 2025",
    sections: [
      {
        heading: "Objet",
        content:
          "Les présentes Conditions Générales d'Utilisation (CGU) définissent les modalités d'accès et d'utilisation de la plateforme BLOQ5, accessible à l'adresse www.bloq5.com. Elles s'appliquent à tout utilisateur (locataire, propriétaire ou gestionnaire) accédant aux services de BLOQ5 INC.",
      },
      {
        heading: "Accès à la plateforme",
        content:
          "L'accès à certaines fonctionnalités de la plateforme nécessite la création d'un compte utilisateur. L'utilisateur s'engage à fournir des informations exactes, complètes et à jour lors de son inscription, et à maintenir la confidentialité de ses identifiants de connexion.\n\nTout compte créé avec de fausses informations pourra être suspendu ou supprimé sans préavis.",
      },
      {
        heading: "Utilisation des services",
        content:
          "L'utilisateur s'engage à utiliser la plateforme de manière licite et conforme aux présentes CGU. Il lui est notamment interdit de :\n• Publier des annonces fausses, trompeuses ou non conformes à la réalité du bien ;\n• Usurper l'identité d'un tiers ;\n• Tenter d'accéder de manière non autorisée aux systèmes de BLOQ5 ;\n• Utiliser la plateforme à des fins illicites, frauduleuses ou contraires à l'ordre public.",
      },
      {
        heading: "Annonces immobilières",
        content:
          "Les propriétaires et gestionnaires s'engagent à publier des annonces fidèles à la réalité du bien loué (surface, état, équipements, prix). BLOQ5 INC. se réserve le droit de retirer toute annonce ne respectant pas ces conditions sans notification préalable.\n\nBLOQ5 INC. agit en qualité d'intermédiaire et n'est pas partie aux contrats conclus entre propriétaires et locataires.",
      },
      {
        heading: "Responsabilités",
        content:
          "BLOQ5 INC. met tout en œuvre pour assurer la disponibilité et la sécurité de la plateforme, mais ne saurait être tenue responsable des interruptions de service, des pertes de données ou des dommages résultant d'une utilisation non conforme aux présentes CGU.\n\nL'utilisateur est seul responsable des contenus qu'il publie sur la plateforme.",
      },
      {
        heading: "Propriété intellectuelle",
        content:
          "Le contenu de la plateforme (algorithmes, design, textes, images, base de données) est protégé par les droits de propriété intellectuelle et appartient à BLOQ5 INC. Toute utilisation non autorisée constitue une contrefaçon susceptible d'engager la responsabilité civile et pénale de l'utilisateur.",
      },
      {
        heading: "Résiliation",
        content:
          "L'utilisateur peut clôturer son compte à tout moment depuis les paramètres de son profil ou en contactant support@bloq5.com. BLOQ5 INC. se réserve le droit de suspendre ou clôturer un compte en cas de violation des présentes CGU.",
      },
      {
        heading: "Modifications des CGU",
        content:
          "BLOQ5 INC. se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés des modifications par e-mail ou notification sur la plateforme. La poursuite de l'utilisation de la plateforme après notification vaut acceptation des nouvelles conditions.",
      },
      {
        heading: "Droit applicable",
        content:
          "Les présentes CGU sont régies par le droit québécois et canadien. Tout litige relatif à leur interprétation ou exécution relève de la compétence exclusive des tribunaux de Montréal, Québec.",
      },
    ],
  },
  {
    id: "confidentialite",
    icon: Shield,
    title: "Politique de confidentialité",
    subtitle: "Comment BLOQ5 collecte, utilise et protège vos données personnelles.",
    color: "#E8F5E9",
    iconColor: "#2E7D32",
    updatedAt: "Mai 2025",
    sections: [
      {
        heading: "Données collectées",
        content:
          "Dans le cadre de l'utilisation de la plateforme, BLOQ5 INC. collecte les catégories de données suivantes :\n• Données d'identification (nom, prénom, adresse e-mail, téléphone) ;\n• Données de connexion (adresse IP, horodatage, navigateur) ;\n• Données de profil (rôle, préférences, historique de recherche) ;\n• Données relatives aux biens (adresse, photos, descriptifs) pour les propriétaires.\n\nLes données de paiement, si applicables, sont traitées directement par nos partenaires certifiés PCI-DSS et ne sont jamais stockées sur nos serveurs.",
      },
      {
        heading: "Finalités du traitement",
        content:
          "Vos données sont utilisées pour :\n• Gérer votre compte et vous fournir les services de la plateforme ;\n• Vous envoyer des communications liées à votre compte (confirmation, OTP, notifications) ;\n• Améliorer nos services par l'analyse anonymisée de l'usage ;\n• Respecter nos obligations légales et réglementaires.",
      },
      {
        heading: "Base légale",
        content:
          "Le traitement de vos données repose sur :\n• L'exécution du contrat liant BLOQ5 INC. à l'utilisateur (CGU) ;\n• Votre consentement explicite pour les communications marketing ;\n• Le respect d'une obligation légale pour les obligations comptables et fiscales.",
      },
      {
        heading: "Conservation des données",
        content:
          "Vos données sont conservées pendant toute la durée de votre relation avec BLOQ5 INC., puis archivées pour une durée de 3 ans à compter de la clôture du compte, sauf obligation légale contraire.",
      },
      {
        heading: "Partage des données",
        content:
          "BLOQ5 INC. ne vend jamais vos données personnelles à des tiers. Certaines données peuvent être partagées avec :\n• Nos sous-traitants techniques (hébergeur, fournisseur de messagerie) dans le cadre strict de leurs missions ;\n• Les autorités compétentes sur réquisition judiciaire.\n\nTout transfert de données hors du Canada est encadré par des garanties appropriées (clauses contractuelles types).",
      },
      {
        heading: "Vos droits",
        content:
          "Conformément à la Loi 25 (Québec) et au RGPD (France), vous disposez des droits suivants :\n• Droit d'accès à vos données ;\n• Droit de rectification des données inexactes ;\n• Droit à l'effacement (« droit à l'oubli ») ;\n• Droit à la portabilité de vos données ;\n• Droit d'opposition au traitement.\n\nPour exercer ces droits, contactez-nous à : support@bloq5.com. Nous répondons dans un délai maximum de 30 jours.",
      },
      {
        heading: "Sécurité",
        content:
          "BLOQ5 INC. met en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, perte, altération ou divulgation : chiffrement TLS en transit, chiffrement au repos, accès restreints par rôle, journalisation des accès.",
      },
      {
        heading: "Contact DPO",
        content:
          "Pour toute question relative à vos données personnelles, vous pouvez contacter notre responsable de la protection des données à l'adresse : support@bloq5.com.",
      },
    ],
  },
];

function DocCard({ doc, isOpen, onToggle }: { doc: LegalDoc; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className={`rounded-2xl border-2 overflow-hidden transition-all ${isOpen ? "shadow-lg" : "shadow-sm hover:shadow-md"}`}
      style={{ borderColor: isOpen ? doc.iconColor + "50" : "#F0F0F0" }}>
      {/* Card header */}
      <button
        className="w-full text-left p-6 flex items-start gap-4 transition-colors"
        style={{ background: isOpen ? doc.color + "60" : "#fff" }}
        onClick={onToggle}
      >
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: doc.color }}>
          <doc.icon className="w-6 h-6" style={{ color: doc.iconColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-base" style={{ color: "#1A1A1A" }}>{doc.title}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{doc.subtitle}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-gray-400">Mise à jour : {doc.updatedAt}</span>
              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                {isOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
              </div>
            </div>
          </div>
          {!isOpen && (
            <span className="inline-block mt-2 text-xs font-semibold" style={{ color: doc.iconColor }}>
              Lire le document →
            </span>
          )}
        </div>
      </button>

      {/* Expanded content */}
      {isOpen && (
        <div className="px-6 pb-8 pt-2" style={{ background: "#FAFAFA" }}>
          <div className="border-t border-gray-100 pt-6 space-y-6">
            {doc.sections.map((s, i) => (
              <div key={i}>
                <h4 className="font-bold text-sm mb-2" style={{ color: "#1A1A1A" }}>
                  {i + 1}. {s.heading}
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{s.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MentionsLegalesPage() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-white font-sans" style={{ color: "#1A1A1A" }}>
      <PublicNavbar />

      {/* Hero */}
      <section className="py-16 px-6 text-center" style={{ background: "#F8F8F8" }}>
        <div className="max-w-2xl mx-auto">
          <span className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-3 py-1 rounded-full" style={{ background: "#FFF8EE", color: YELLOW }}>
            Informations légales
          </span>
          <h1 className="text-3xl md:text-4xl font-black mb-4" style={{ color: "#1A1A1A" }}>
            Mentions légales & CGU
          </h1>
          <p className="text-gray-500 leading-relaxed">
            Consultez nos documents légaux en sélectionnant la carte correspondante. Chaque section est dépliable et détaille l'ensemble des informations requises.
          </p>
        </div>
      </section>

      {/* Cards */}
      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {DOCS.map(doc => (
            <DocCard
              key={doc.id}
              doc={doc}
              isOpen={openId === doc.id}
              onToggle={() => setOpenId(openId === doc.id ? null : doc.id)}
            />
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-10">
          Pour toute question, contactez-nous à{" "}
          <a href="mailto:support@bloq5.com" className="underline hover:text-gray-600">support@bloq5.com</a>
        </p>
      </section>

      <SiteFooter />
    </div>
  );
}
