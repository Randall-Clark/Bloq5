export interface ArticleSection {
  heading?: string;
  body: string;
}

export interface Article {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  img: string;
  date: string;
  readTime: string;
  sections: ArticleSection[];
}

export const ARTICLES: Article[] = [
  {
    slug: "gestion-locative-delegation",
    category: "Guide propriétaire",
    title: "Gestion locative au Canada : comment déléguer en toute sérénité",
    excerpt: "Déléguer la gestion de votre bien à un professionnel vous fait gagner du temps et sécurise vos revenus. Découvrez nos conseils.",
    img: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80",
    date: "28 avril 2025",
    readTime: "6 min",
    sections: [
      {
        body: "Gérer un bien locatif demande du temps, des compétences juridiques et une disponibilité que beaucoup de propriétaires ne peuvent pas toujours offrir. La délégation de gestion locative est une solution qui séduit de plus en plus de Canadiens — et pour de bonnes raisons.",
      },
      {
        heading: "Pourquoi déléguer la gestion de votre bien ?",
        body: "Un propriétaire qui gère seul son bien doit jongler entre la recherche de locataires, la rédaction du bail, la collecte des loyers, la gestion des réparations et la conformité avec la réglementation locale. Au Québec, la Loi sur la protection du consommateur et le Code civil imposent des obligations précises que méconnaître peut coûter cher.\n\nDéléguer à un gestionnaire professionnel vous permet de vous décharger de ces responsabilités tout en maintenant une vision claire sur vos revenus et l'état de votre bien.",
      },
      {
        heading: "Ce qu'un gestionnaire professionnel prend en charge",
        body: "Un bon gestionnaire locatif s'occupe de l'intégralité du cycle locatif :\n\n• **Publication et diffusion de l'annonce** : rédaction, photos, mise en ligne sur les plateformes pertinentes.\n• **Sélection des locataires** : vérification des références, analyse du dossier financier, entretiens.\n• **Rédaction du bail** : conforme aux lois provinciales en vigueur, personnalisé selon votre bien.\n• **Collecte des loyers** : suivi des paiements, relances en cas de retard, gestion des impayés.\n• **Entretien et réparations** : réseau de prestataires qualifiés, intervention rapide.\n• **États des lieux** : entrée et sortie documentées, protection contre les litiges.",
      },
      {
        heading: "Comment choisir le bon gestionnaire ?",
        body: "Avant de signer un mandat de gestion, vérifiez plusieurs points essentiels :\n\n**Les accréditations** : au Québec, un gestionnaire doit détenir une licence de l'OACIQ (Organisation des agences commerciales en immobilier du Québec) pour certaines activités. Vérifiez toujours ses certifications.\n\n**Les honoraires** : les commissions varient généralement entre 5 % et 10 % des loyers encaissés. Méfiez-vous des offres trop basses qui pourraient cacher des frais supplémentaires.\n\n**La transparence** : un bon gestionnaire vous fournit des rapports mensuels détaillés et vous tient informé de toute décision importante.\n\n**Les références** : n'hésitez pas à contacter d'autres propriétaires qui ont fait appel à ses services.",
      },
      {
        heading: "BLOQ5 : la gestion locative simplifiée",
        body: "Avec BLOQ5, vous bénéficiez d'une plateforme numérique qui centralise toute la gestion de votre bien : suivi des loyers en temps réel, accès aux dossiers locataires, signature électronique des baux et communication directe avec vos locataires — le tout depuis un tableau de bord intuitif.\n\nNos propriétaires pros constatent en moyenne un gain de 8 heures par mois sur la gestion administrative, et une réduction significative des périodes de vacance locative grâce à notre système de qualification des candidatures.",
      },
      {
        heading: "Les points à négocier dans le mandat de gestion",
        body: "Avant de signer, assurez-vous que le contrat précise clairement : la durée du mandat et les conditions de résiliation, les seuils de dépenses pour lesquels votre accord est requis, les modalités de reversement des loyers (fréquence, délais), et la liste exacte des prestations incluses dans les honoraires de gestion.",
      },
    ],
  },
  {
    slug: "bail-commercial-quebec",
    category: "Marché commercial",
    title: "Bail commercial au Québec : ce que tout propriétaire doit savoir",
    excerpt: "Durée, indice de révision, clause de sortie — le bail commercial québécois a ses spécificités. On vous explique tout.",
    img: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    date: "20 avril 2025",
    readTime: "8 min",
    sections: [
      {
        body: "Contrairement au bail résidentiel, le bail commercial au Québec est largement régi par la liberté contractuelle. Cela signifie que propriétaires et locataires disposent d'une grande latitude pour négocier les conditions — mais aussi que chaque clause doit être rédigée avec une attention particulière, car les recours en cas de litige sont moins automatiques.",
      },
      {
        heading: "Les caractéristiques fondamentales du bail commercial",
        body: "Un bail commercial couvre la location d'un espace destiné à l'exercice d'une activité commerciale, industrielle ou de services. Il peut porter sur un bureau, un local commercial en rez-de-chaussée, un entrepôt ou une zone industrielle.\n\nÀ la différence du bail résidentiel encadré par la Régie du logement (Tribunal administratif du logement depuis 2020), le bail commercial est soumis au Code civil du Québec (articles 1851 et suivants) et, dans de nombreux cas, à la Loi sur les baux commerciaux.",
      },
      {
        heading: "La durée du bail",
        body: "La durée d'un bail commercial est librement négociable. Elle varie généralement de 1 à 10 ans. Les baux à long terme (5 ans et plus) offrent une stabilité appréciable pour les deux parties, mais prévoient presque toujours des clauses de révision du loyer.\n\nUn locataire commercial bénéficie souvent d'une période de franchise (loyer gratuit) au démarrage pour financer ses travaux d'aménagement. Cette période doit être expressément mentionnée dans le bail.",
      },
      {
        heading: "Le loyer et les modalités de révision",
        body: "Le loyer commercial peut être fixé de plusieurs façons :\n\n• **Loyer brut** : le propriétaire assume la majorité des charges (taxes, assurances, entretien).\n• **Loyer net** : le locataire prend en charge une partie ou la totalité des charges.\n• **Loyer net-net-net (triple net)** : le locataire paie le loyer de base plus toutes les charges (taxes foncières, assurances, entretien structurel).\n\nLa clause d'indexation du loyer est cruciale. Elle peut être basée sur l'Indice des prix à la consommation (IPC), sur un pourcentage fixe annuel, ou sur le chiffre d'affaires du locataire (bail à pourcentage).",
      },
      {
        heading: "Les clauses à surveiller",
        body: "**La clause d'usage exclusif** : elle interdit au propriétaire de louer à un concurrent direct dans le même immeuble ou centre commercial.\n\n**La clause de cession et sous-location** : dans un bail commercial, la cession du bail à un tiers (lors d'une vente de commerce, par exemple) est souvent soumise à l'accord du propriétaire. Négociez une clause autorisant la cession en cas de vente de l'entreprise.\n\n**La clause de résiliation anticipée** : prévoyez les conditions dans lesquelles vous ou votre locataire pouvez mettre fin au bail avant son terme (pénalité, préavis).\n\n**La clause de travaux** : qui prend en charge les travaux d'aménagement initiaux ? Qui en garde la propriété à la fin du bail ?",
      },
      {
        heading: "La reconduction du bail commercial",
        body: "À l'expiration du bail, le locataire commercial n'a pas automatiquement droit au renouvellement, contrairement au bail résidentiel. Il est donc essentiel de prévoir une option de renouvellement dans le contrat initial, avec les conditions de ce renouvellement (durée, loyer) clairement définies.\n\nUn propriétaire qui souhaite récupérer son local doit généralement en informer le locataire dans les délais prévus au bail. À défaut, le bail peut se renouveler tacitement.",
      },
      {
        heading: "Faire appel à un professionnel",
        body: "La complexité du bail commercial justifie le recours à un avocat spécialisé en droit immobilier ou à un notaire pour la rédaction ou la révision du contrat. Les enjeux financiers et les durées d'engagement en font un document qui mérite toute votre attention avant signature.",
      },
    ],
  },
  {
    slug: "dossier-locataire-solide",
    category: "Guide locataire",
    title: "Constituer un dossier locataire solide : les documents indispensables",
    excerpt: "Préparez un dossier complet et convaincant pour mettre toutes les chances de votre côté lors de votre prochaine candidature.",
    img: "https://images.unsplash.com/photo-1568992688065-536aad8a12f6?w=800&q=80",
    date: "8 avril 2025",
    readTime: "4 min",
    sections: [
      {
        body: "Dans un marché locatif de plus en plus concurrentiel, avoir un dossier de candidature bien préparé peut faire toute la différence. Un dossier solide rassure le propriétaire, accélère la décision et vous positionne favorablement face aux autres candidats.",
      },
      {
        heading: "Les documents d'identité",
        body: "La base de tout dossier locataire : une pièce d'identité valide. Au Canada, vous pouvez fournir :\n\n• Un permis de conduire provincial\n• Un passeport canadien ou étranger\n• Une carte de résident permanent\n• Un permis de travail ou d'études (pour les candidats étrangers)\n\nPréparez une copie numérique claire et lisible. Certains propriétaires demandent deux pièces d'identité pour les non-résidents permanents.",
      },
      {
        heading: "La preuve de revenus",
        body: "C'est le document le plus scruté par les propriétaires. Il doit démontrer que vous pouvez assumer le loyer de façon pérenne. La règle non officielle : votre revenu mensuel brut doit représenter au minimum 2,5 à 3 fois le loyer mensuel.\n\n**Pour les salariés :** les trois derniers bulletins de salaire, une lettre d'emploi récente (moins de 3 mois) précisant votre poste, votre ancienneté et votre salaire annuel, et si possible votre avis de cotisation de l'ARC (Agence du revenu du Canada) pour l'année précédente.\n\n**Pour les travailleurs autonomes et indépendants :** vos avis de cotisation des deux dernières années, un relevé bancaire des 3 derniers mois, et éventuellement une lettre de votre comptable attestant vos revenus.\n\n**Pour les étudiants :** une lettre d'inscription, une preuve de financement (bourse, prêt étudiant, aide parentale) et si possible un co-signataire.",
      },
      {
        heading: "Les références",
        body: "Un propriétaire veut savoir si vous avez été un bon locataire par le passé. Préparez les coordonnées de vos anciens propriétaires (nom, téléphone, adresse du bien loué). Deux références minimum sont généralement demandées.\n\nSi vous louez pour la première fois, des références professionnelles (employeur, professeur) peuvent suppléer l'absence de références locatives.",
      },
      {
        heading: "La lettre de motivation",
        body: "Souvent sous-estimée, la lettre de présentation peut faire pencher la balance en votre faveur. Présentez-vous brièvement : votre situation professionnelle, le motif de votre recherche, votre mode de vie (calme, non-fumeur, sans animaux ou avec), et votre intérêt pour le bien en particulier. Une lettre sincère et concise (½ page) montre votre sérieux et humanise votre candidature.",
      },
      {
        heading: "Les erreurs à éviter",
        body: "• Envoyer un dossier incomplet : le propriétaire passera au candidat suivant.\n• Fournir des documents illisibles ou périmés.\n• Omettre de mentionner un animal de compagnie (cela peut entraîner la résiliation du bail).\n• Gonfler ses revenus : les vérifications sont systématiques et une fausse déclaration peut entraîner la nullité du bail.\n\nAvec BLOQ5, votre dossier locataire numérique est stocké de façon sécurisée et peut être partagé en un clic avec plusieurs propriétaires, tout en respectant la confidentialité de vos données.",
      },
    ],
  },
  {
    slug: "resiliation-bail",
    category: "Juridique",
    title: "Résiliation de bail en cours : droits et obligations des parties",
    excerpt: "Quelles conditions permettent de mettre fin à un bail avant son terme ? Ce que dit la loi au Québec et en Ontario.",
    img: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80",
    date: "1 avril 2025",
    readTime: "7 min",
    sections: [
      {
        body: "Un bail est un engagement contractuel qui lie propriétaire et locataire pour une durée déterminée. Pourtant, des situations imprévues — déménagement pour raisons professionnelles, séparation, difficultés financières — peuvent rendre nécessaire une résiliation anticipée. Voici ce que prévoient les lois québécoise et ontarienne.",
      },
      {
        heading: "La résiliation par le locataire au Québec",
        body: "Selon le Code civil du Québec, un locataire ne peut pas résilier son bail unilatéralement avant son terme sans motif valable. Cependant, la loi prévoit plusieurs situations permettant une résiliation anticipée :\n\n**Mutation professionnelle ou perte d'emploi :** si vous devez déménager à plus de 80 km de votre résidence actuelle pour raisons professionnelles, vous pouvez résilier avec un préavis de 2 mois.\n\n**Raisons de santé :** si vous êtes contraint de quitter votre logement pour intégrer un centre de soins de longue durée, un préavis de 3 mois est suffisant.\n\n**Violence conjugale ou agression sexuelle :** la loi québécoise (L.R.Q., c. T-15.01) permet une résiliation immédiate avec un préavis d'un mois, sur présentation d'une ordonnance de protection ou d'une plainte policière.\n\nDans tous les autres cas, le locataire doit continuer à payer le loyer jusqu'à la fin du bail, ou trouver un sous-locataire ou un cessionnaire acceptable pour le propriétaire.",
      },
      {
        heading: "La cession de bail : une alternative à la résiliation",
        body: "La cession de bail permet au locataire de transférer l'ensemble de ses droits et obligations à un tiers. Le propriétaire ne peut refuser une cession que pour un motif sérieux (antécédents de mauvais paiement, incompatibilité avec les règles de l'immeuble).\n\nPour céder son bail, le locataire doit :\n1. Informer le propriétaire par écrit avec un préavis de 10 jours\n2. Présenter le candidat cessionnaire au propriétaire\n3. Attendre l'accord ou le refus du propriétaire dans les 15 jours\n\nEn cas de refus jugé abusif, le locataire peut s'adresser au Tribunal administratif du logement (TAL).",
      },
      {
        heading: "La résiliation par le propriétaire",
        body: "Un propriétaire ne peut pas résilier un bail résidentiel à sa guise. Les motifs légaux de résiliation sont limitativement énumérés par la loi :\n\n• **Non-paiement du loyer :** après mise en demeure, le propriétaire peut demander la résiliation au TAL.\n• **Troubles de voisinage graves et répétés :** avec preuves à l'appui.\n• **Utilisation du logement à des fins illicites.**\n• **Reprise du logement :** pour y loger un proche (enfant, parent, conjoint), sous conditions strictes et avec préavis de 6 mois.\n• **Éviction pour agrandissement ou démolition :** prévue par la loi avec indemnisation.",
      },
      {
        heading: "En Ontario : des règles similaires mais distinctes",
        body: "En Ontario, la Loi sur la location à usage d'habitation (LLH) encadre strictement les résiliations. Le locataire peut résilier un bail à durée déterminée en donnant un préavis de 60 jours avant la fin du bail.\n\nPour une résiliation anticipée, le locataire doit :\n• Obtenir l'accord écrit du propriétaire\n• Trouver un sous-locataire ou cessionnaire acceptable\n• Ou attendre la fin du bail\n\nLe propriétaire, lui, peut demander l'expulsion via la Commission de location immobilière (CLI) pour non-paiement, comportement abusif ou occupation illégale.",
      },
      {
        heading: "Conseils pratiques",
        body: "Quelle que soit votre situation, documentez tout par écrit. En cas de litige, les communications par courriel ou courrier recommandé sont vos meilleures protections. N'hésitez pas à consulter un avocat spécialisé en droit locatif ou à contacter l'aide juridique si vos revenus le permettent.",
      },
    ],
  },
  {
    slug: "revenus-locatifs-fiscalite",
    category: "Fiscalité",
    title: "Revenus locatifs au Canada : comment optimiser votre déclaration fiscale",
    excerpt: "Déductions admissibles, amortissement, frais de gestion — les règles fiscales pour les propriétaires bailleurs en 2025.",
    img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80",
    date: "22 mars 2025",
    readTime: "9 min",
    sections: [
      {
        body: "Au Canada, les revenus tirés de la location d'un bien immobilier sont imposables. Mais la loi fiscale prévoit de nombreuses déductions qui permettent de réduire considérablement la charge fiscale des propriétaires bailleurs. Le tout est de bien les connaître — et de conserver les justificatifs.",
      },
      {
        heading: "Que sont les revenus locatifs imposables ?",
        body: "Tous les loyers perçus dans l'année civile doivent être déclarés dans votre déclaration de revenus fédérale (T1) et provinciale (TP-1 au Québec). Cela inclut :\n\n• Les loyers mensuels habituels\n• Les dépôts de garantie conservés (non remboursés)\n• Les services additionnels facturés (stationnement, rangement, buanderie)\n• Les loyers perçus d'avance pour l'année suivante (pro rata)\n\nAttention : si vous louez une partie de votre résidence principale (par exemple, un sous-sol), une portion des revenus et des dépenses est calculée proportionnellement à la surface louée.",
      },
      {
        heading: "Les dépenses déductibles",
        body: "L'Agence du revenu du Canada (ARC) reconnaît de nombreuses dépenses déductibles pour les propriétaires bailleurs :\n\n**Frais de financement :** les intérêts sur votre prêt hypothécaire (mais pas le capital remboursé) sont entièrement déductibles. C'est souvent la déduction la plus importante.\n\n**Taxes foncières et frais municipaux :** 100 % déductibles si le bien est intégralement loué.\n\n**Assurance :** primes d'assurance habitation, responsabilité civile, loyer garanti.\n\n**Entretien et réparations courantes :** peinture, plomberie, remplacement d'appareils électroménagers défectueux. Attention : les améliorations (agrandissement, rénovation majeure) ne sont pas immédiatement déductibles mais s'ajoutent au coût en capital du bien.\n\n**Frais de gestion :** honoraires d'un gestionnaire locatif ou d'une agence, frais de mise en location, publicité.\n\n**Frais de déplacement :** si vous vous rendez sur place pour superviser des travaux ou effectuer une inspection (conservez le kilométrage).\n\n**Frais professionnels :** comptable, avocat, frais BLOQ5 pour la gestion de votre bien.",
      },
      {
        heading: "La déduction pour amortissement (DPA)",
        body: "Les biens immobiliers peuvent faire l'objet d'une Déduction pour amortissement (DPA), qui reflète la dépréciation du bâtiment (et non du terrain) dans le temps. Le taux habituel pour les bâtiments résidentiels est de 4 % de la valeur amortissable (Catégorie 1).\n\n**Attention :** la DPA ne peut pas créer une perte nette de location. De plus, lors de la revente du bien, une récupération d'amortissement peut augmenter votre revenu imposable. Consultez un comptable avant d'y recourir.",
      },
      {
        heading: "Particularités québécoises",
        body: "Au Québec, les règles provinciales suivent généralement les règles fédérales, mais quelques spécificités méritent attention :\n\n• Le crédit d'impôt pour maintien à domicile peut s'appliquer si vous louez à une personne âgée.\n• La taxe de bienvenue (droits de mutation) n'est pas déductible mais peut être ajoutée au coût en capital.\n• Revenu Québec peut demander les mêmes justificatifs que l'ARC, assurez-vous de conserver toutes vos factures.",
      },
      {
        heading: "Tenir une comptabilité rigoureuse",
        body: "Pour bénéficier pleinement de ces déductions, tenez un registre détaillé de toutes vos recettes et dépenses locatives. Conservez factures, relevés bancaires et contrats pendant au moins 6 ans (délai de prescription fiscale).\n\nBLOQ5 Pro vous permet de centraliser vos documents financiers et d'exporter un rapport annuel de vos revenus et dépenses, prêt à être transmis à votre comptable.",
      },
    ],
  },
  {
    slug: "colocation-gestion",
    category: "Guide propriétaire",
    title: "Colocation : comment gérer un bien multi-locataires efficacement",
    excerpt: "Colocation étudiante ou professionnelle, gestion des chambres individuelles, baux multiples — nos bonnes pratiques.",
    img: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800&q=80",
    date: "14 mars 2025",
    readTime: "5 min",
    sections: [
      {
        body: "La colocation est en plein essor au Canada, portée par la hausse des loyers dans les grandes métropoles et l'évolution des modes de vie. Pour le propriétaire, elle offre un rendement locatif supérieur — mais implique une gestion plus complexe. Voici comment s'y prendre.",
      },
      {
        heading: "Bail unique ou baux individuels ?",
        body: "C'est le premier choix stratégique du propriétaire bailleur en colocation :\n\n**Le bail unique :** tous les colocataires signent un seul contrat et sont solidairement responsables du loyer. Si l'un d'eux ne paie pas, les autres doivent compenser. Cette formule simplifie la gestion mais peut créer des tensions entre colocataires.\n\n**Les baux individuels :** chaque colocataire signe son propre bail pour sa chambre, avec une part des parties communes. Le propriétaire encaisse les loyers séparément et peut remplacer un colocataire sans affecter les autres. La gestion est plus lourde mais offre plus de flexibilité.",
      },
      {
        heading: "Bien sélectionner les colocataires",
        body: "En colocation, la compatibilité entre colocataires est aussi importante que leur solvabilité. Lors de la sélection, évaluez :\n\n• Les horaires et rythmes de vie (études, travail de nuit)\n• Les habitudes (fumeur, animaux, habitudes de propreté)\n• La stabilité financière de chacun\n• La durée d'engagement prévue\n\nN'hésitez pas à organiser une rencontre entre les candidats avant de signer les baux. Un bon groupe de colocataires réduit considérablement le turnover et les conflits.",
      },
      {
        heading: "Définir les règles de vie commune",
        body: "Un règlement intérieur clair, annexé au bail, prévient la majorité des conflits :\n\n• Répartition des tâches ménagères dans les espaces communs\n• Règles sur les invités et les nuits supplémentaires\n• Niveau sonore et heures de calme\n• Utilisation des espaces communs (cuisine, salon, salle de bain)\n• Procédure de départ et de remplacement d'un colocataire\n\nMême si ce règlement n'a pas de valeur juridique contraignante, il sert de référence en cas de conflit.",
      },
      {
        heading: "Gérer le turnover des chambres",
        body: "Le principal défi de la colocation pour le propriétaire est la gestion des départs et arrivées successives. Pour minimiser les périodes de vacance :\n\n• Prévenez les colocataires en place dès qu'une chambre se libère et impliquez-les dans la recherche du nouveau profil.\n• Gardez un vivier de candidats potentiels en maintenant votre annonce active sur BLOQ5.\n• Réalisez un état des lieux de la chambre concernée dès le départ et refaites-la si nécessaire avant la nouvelle entrée.\n• Prévoyez dans le bail un préavis suffisant (30 à 60 jours) pour avoir le temps de trouver un remplaçant.",
      },
      {
        heading: "Le rendement de la colocation",
        body: "À titre d'exemple, un appartement de 4 chambres à Montréal qui se loue 2 400 $/mois en location classique peut rapporter jusqu'à 3 200 $/mois en colocation (4 × 800 $), soit un gain de 33 %. Ce surrendement compense largement la gestion plus intensive.\n\nAvec BLOQ5, vous gérez chaque chambre individuellement depuis un seul tableau de bord : loyers, dossiers candidats, états des lieux et communications — tout en un.",
      },
    ],
  },
  {
    slug: "local-commercial-montreal",
    category: "Marché commercial",
    title: "Louer un local commercial à Montréal : les quartiers à surveiller en 2025",
    excerpt: "Mile End, Griffintown, Rosemont — quelles artères offrent le meilleur rapport qualité/prix pour les commerces ?",
    img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
    date: "5 mars 2025",
    readTime: "6 min",
    sections: [
      {
        body: "Le marché de la location commerciale à Montréal a connu des transformations profondes depuis la pandémie. Certains quartiers ont rebondi avec éclat, d'autres peinent encore à retrouver leur dynamisme. Tour d'horizon des zones à considérer pour votre prochain local commercial en 2025.",
      },
      {
        heading: "Mile End : créativité et clientèle internationale",
        body: "Le Mile End reste l'un des quartiers les plus prisés des créatifs, restaurateurs et boutiques indépendantes. La rue Saint-Laurent entre le boulevard Saint-Joseph et l'avenue Laurier concentre une offre commerciale diversifiée et une clientèle aisée.\n\n**Loyers moyens :** 35 à 55 $/pi² (pieds carrés) par an selon l'emplacement et la visibilité. Les espaces en rez-de-chaussée sur les artères principales sont les plus chers.\n\n**Idéal pour :** restaurants, galeries, boutiques mode, coworking, ateliers créatifs.\n\n**À surveiller :** le taux de vacance reste faible mais les loyers ont augmenté de 12 % entre 2023 et 2025.",
      },
      {
        heading: "Griffintown : le quartier en pleine mutation",
        body: "Ancienne zone industrielle transformée en quartier résidentiel et commercial tendance, Griffintown attire une clientèle jeune et active. Le développement immobilier y est encore intense, ce qui crée des opportunités à des tarifs parfois inférieurs à ceux du Plateau.\n\n**Loyers moyens :** 28 à 45 $/pi²\n\n**Idéal pour :** restauration rapide haut de gamme, fitness, services de proximité, bureaux.\n\n**Points d'attention :** la clientèle est encore en cours de consolidation. Préférez les emplacements proches des nouveaux projets résidentiels livrés.",
      },
      {
        heading: "Rosemont – La Petite-Patrie : la valeur sûre abordable",
        body: "Prisé pour son authenticité et ses loyers plus accessibles que le Plateau-Mont-Royal voisin, Rosemont attire de nombreux commerçants en quête d'un premier local. La rue Masson et le boulevard Rosemont sont les deux artères commerciales principales.\n\n**Loyers moyens :** 22 à 38 $/pi²\n\n**Idéal pour :** épiceries spécialisées, cafés, services locaux, artisans.\n\n**Tendance 2025 :** fort retour des commerces de bouche et des services de santé alternative (naturopathie, yoga, kinésithérapie).",
      },
      {
        heading: "Le Plateau-Mont-Royal : le classique toujours demandé",
        body: "Avenue du Mont-Royal, rue Saint-Denis, avenue Laurier — ces artères emblématiques affichent des taux de vacance parmi les plus bas de Montréal. Le Plateau reste une valeur sûre mais les loyers y sont élevés.\n\n**Loyers moyens :** 40 à 65 $/pi²\n\n**Idéal pour :** restaurants, boutiques mode/déco, services professionnels.\n\n**Conseil :** négociez une période de franchise au démarrage et une option de renouvellement à terme fixe pour verrouiller votre loyer sur la durée.",
      },
      {
        heading: "Saint-Henri et Verdun : les quartiers montants",
        body: "Ces deux quartiers de l'arrondissement Sud-Ouest connaissent une gentrification progressive mais rapide. Les loyers y sont encore inférieurs à ceux du centre-ville, mais leur progression depuis 3 ans est significative (+18 % à Saint-Henri).\n\n**Loyers moyens :** 20 à 35 $/pi²\n\n**Idéal pour :** bars, restaurants branchés, studios de fitness, espaces événementiels.\n\nBLOQ5 recense des centaines de locaux commerciaux disponibles dans ces quartiers. Créez une alerte pour être notifié dès qu'un local correspondant à vos critères est mis en ligne.",
      },
    ],
  },
  {
    slug: "visite-virtuelle",
    category: "Guide locataire",
    title: "Visite virtuelle : comment évaluer un bien à distance avant de signer",
    excerpt: "Les visites 3D Matterport et les outils de visite virtuelle changent la façon dont les locataires choisissent leur logement.",
    img: "https://images.unsplash.com/photo-1524813686514-a57563d77965?w=800&q=80",
    date: "25 février 2025",
    readTime: "4 min",
    sections: [
      {
        body: "Louer un appartement sans l'avoir visité physiquement était impensable il y a dix ans. Aujourd'hui, la visite virtuelle est devenue une pratique courante — et parfois incontournable — pour les locataires qui cherchent à distance ou qui manquent de temps. Mais comment évaluer réellement un bien à travers un écran ?",
      },
      {
        heading: "Les différentes technologies de visite virtuelle",
        body: "Toutes les visites virtuelles ne se valent pas. Il existe principalement deux formats :\n\n**La visite 3D Matterport :** c'est le gold standard. La caméra Matterport crée un modèle tridimensionnel complet du bien dans lequel vous naviguez librement. Vous pouvez passer d'une pièce à l'autre, regarder dans toutes les directions, zoomer, et même mesurer les espaces virtuellement. C'est la solution la plus fidèle à la réalité.\n\n**Les vidéos en visite guidée :** un propriétaire ou agent filme le bien en se déplaçant et commente en direct (ou en différé). La qualité dépend entièrement de la personne qui filme — certaines sont excellentes, d'autres occultent les défauts.\n\n**Les photos panoramiques 360° :** moins immersives que la 3D Matterport, elles permettent néanmoins de voir l'ensemble d'une pièce en faisant pivoter l'image.",
      },
      {
        heading: "Ce qu'une visite virtuelle permet d'évaluer",
        body: "Une bonne visite virtuelle vous donnera des informations précieuses sur :\n\n• **La disposition des pièces** et les circulations (les plans 2D peuvent être trompeurs)\n• **La luminosité** naturelle (regardez la position des fenêtres et l'orientation)\n• **L'état général** du bien (peinture, sol, équipements visibles)\n• **Le volume** des pièces, souvent plus parlant qu'une surface en m²\n• **Les finitions** et le niveau de soin apporté par le propriétaire",
      },
      {
        heading: "Ce qu'elle ne remplace pas",
        body: "Même la meilleure visite virtuelle ne peut pas vous révéler :\n\n• **L'environnement sonore** : circulation, voisinage bruyant, proximité d'un bar ou d'un restaurant\n• **Les odeurs** : humidité, moisissures, cigarette\n• **La pression de l'eau** et le débit de la douche\n• **La qualité de l'isolation thermique** (courants d'air, ponts thermiques)\n• **L'ambiance du quartier** aux différentes heures de la journée\n\nSi possible, complétez toujours une visite virtuelle par une visite physique avant de signer — ou demandez à un proche de se déplacer à votre place.",
      },
      {
        heading: "Les questions à poser lors d'une visite virtuelle en direct",
        body: "Si la visite est réalisée en visioconférence avec le propriétaire ou l'agent, préparez vos questions à l'avance :\n\n• Pouvez-vous ouvrir les placards et les rangements ?\n• Quelle est l'orientation du salon / des chambres ?\n• Y a-t-il une cave, un grenier, un stationnement inclus ?\n• Quelles sont les charges communes et qu'incluent-elles ?\n• Le chauffage est-il inclus dans le loyer ?\n• Y a-t-il des travaux prévus dans l'immeuble ?",
      },
      {
        heading: "BLOQ5 et la visite virtuelle",
        body: "Sur BLOQ5, les propriétaires peuvent intégrer directement un lien de visite virtuelle (Matterport, YouTube, etc.) dans leur annonce. Les locataires peuvent ainsi évaluer le bien depuis chez eux avant de prendre rendez-vous pour une visite physique — réduisant les visites inutiles de part et d'autre, et accélérant le processus de location.",
      },
    ],
  },
];
