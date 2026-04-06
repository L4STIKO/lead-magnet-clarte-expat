// ── Types ──
export interface ActionRow {
  action: string
  how: string
  why: string
}

export interface Step {
  number: number
  title: string
  subtitle: string
  milestone?: string
  rows: ActionRow[]
  result: string
}

export interface ChecklistCategory {
  emoji: string
  title: string
  items: string[]
}

// ── Steps ──
export const steps: Step[] = [
  {
    number: 1,
    title: "DÉFINIS CE QUE TU VEUX VRAIMENT CONSTRUIRE",
    subtitle: "Avant tout — la clarté sur ton projet conditionne toutes tes décisions",
    rows: [
      {
        action: "Définir pourquoi tu veux partir",
        how: "Liste sur une feuille toutes les raisons qui te poussent vers ce projet — fiscalité, liberté, qualité de vie, envie de nouveauté, ras-le-bol du système français",
        why: "Avoir une vision claire de ton projet. Si tu pars pour de mauvaises raisons tu seras malheureux même avec une situation fiscale parfaite",
      },
      {
        action: "Lister ce qui est important pour toi",
        how: "Écris ce qui compte vraiment — garder un lien avec ta famille, lancer un business, construire une nouvelle vie, voyager, avoir du temps libre",
        why: "Identifier ce que tu veux préserver dans ta nouvelle vie pour que tes décisions soient alignées avec tes vraies priorités",
      },
      {
        action: "Identifier tes non-négociables",
        how: "Écris ce sur quoi tu ne transigeras pas — vivre près de la mer, rentrer au moins X fois par an en France, ne pas dépenser plus de X€/mois, avoir une communauté autour de toi",
        why: "Ce sont les lignes rouges de ton projet. Elles guideront tous tes choix concrets — ville, visa, budget",
      },
      {
        action: "Définir ton résultat dans 2 ans",
        how: "Décris ta vie idéale dans 2 ans — où tu vis, ce que tu fais, combien tu gagnes, comment tu passes tes journées",
        why: "Sans destination claire tu risques de te retrouver installé en Thaïlande sans vraiment savoir pourquoi ni quoi faire",
      },
      {
        action: "Identifier tes contraintes réelles",
        how: "Liste ce qui pourrait freiner ou complexifier ton départ — bien immobilier en France, clients français, contrats en cours, famille, obligations financières",
        why: "Anticiper ces contraintes maintenant évite les mauvaises surprises au moment du départ",
      },
    ],
    result: "Une vision claire et honnête de ce que tu construis. Toutes tes décisions suivantes — visa, structure, fiscalité — seront alignées avec ton projet de vie.",
  },
  {
    number: 2,
    title: "PRÉPARE TON INSTALLATION EN THAÏLANDE",
    subtitle: "Construire ta nouvelle vie sur des bases concrètes",
    milestone: "Jalon M+1",
    rows: [
      {
        action: "Choisir ton lieu de vie",
        how: "Compare les options selon ton style de vie — Bangkok pour le réseau business et les opportunités, Chiang Mai pour la tranquillité et le coût de vie réduit, les îles pour le lifestyle mais attention à l'isolement",
        why: "Chaque ville a un impact direct sur ton quotidien, ton réseau et tes opportunités business",
      },
      {
        action: "Identifier le bon visa",
        how: "Renseigne-toi sur les 3 options principales — DTV si tu travailles en remote pour des clients étrangers, LTR si tu as des revenus passifs, Non-Imm B si tu crées une structure locale en Thaïlande",
        why: "Le mauvais visa peut bloquer ton installation ou rendre ton activité illégale sur le territoire",
      },
      {
        action: "Vérifier la cohérence visa et activité",
        how: "Avant de choisir ton visa confirme qu'il est compatible avec ton activité professionnelle et ta future structure juridique",
        why: "Certains visas ne sont pas compatibles avec certaines structures — un point à vérifier avant de créer quoi que ce soit",
      },
      {
        action: "Anticiper ton budget de vie réel",
        how: "Estime ton budget mensuel selon ton style de vie — loyer, assurance santé, nourriture, transports, sorties, voyages. Prévois entre 1 500€/mois pour un mode de vie simple, 2 500€ pour un confort correct, 5 000€ pour vivre sans contrainte",
        why: "Beaucoup de gens sous-estiment leur budget et se retrouvent en difficulté financière dans les premiers mois",
      },
      {
        action: "Trouver un logement",
        how: "Cherche un appartement avec un contrat de bail de 6 à 12 mois à ton nom — passe par des agences locales, des groupes Facebook expats ou des plateformes comme DDproperty ou Hipflat. Visite plusieurs quartiers avant de te décider",
        why: "C'est ton nouveau lieu de vie — prendre le temps de bien choisir ton logement et ton quartier est essentiel pour te sentir bien et t'intégrer rapidement",
      },
    ],
    result: "Tu arrives en Thaïlande avec un plan concret. Tu sais où tu vis, avec quel visa, et ce que ça coûte vraiment.",
  },
  {
    number: 3,
    title: "CRÉE TA STRUCTURE JURIDIQUE À L'ÉTRANGER",
    subtitle: "La fondation de ton activité — sans ça tu factures dans le vide",
    milestone: "Jalon M+1",
    rows: [
      {
        action: "Choisir la structure adaptée à ton profil",
        how: "Définis d'abord ton activité — est-ce que tu travailles à distance pour des clients étrangers ou est-ce que tu veux développer une activité locale en Thaïlande ? En fonction de ta réponse tu choisis une structure juridique étrangère adaptée",
        why: "Le mauvais choix coûte cher à corriger — prendre le temps de bien analyser son profil avant de créer quoi que ce soit",
      },
      {
        action: "Créer sa structure avec le bon prestataire",
        how: "Prends le temps de choisir un prestataire sérieux pour ouvrir ta structure à l'étranger — il doit pouvoir t'accompagner sur les obligations légales, les délais et les coûts réels",
        why: "Une structure mal créée va apporter des problèmes par la suite — mauvais état, mauvaise configuration, obligations ignorées",
      },
      {
        action: "Ouvrir un compte bancaire pro au nom de la structure",
        how: "Renseigne-toi sur les solutions bancaires compatibles avec ta structure — Wise Business, Revolut Business, Mercury, Payoneer selon les devises et les pays de tes clients",
        why: "Recevoir tes paiements clients sur un compte au nom de ta structure est la base — jamais sur ton compte perso français",
      },
      {
        action: "Créer un système de facturation et de comptabilité",
        how: "Vérifie si la gestion comptable est incluse dans ta prestation. Sinon mets en place une méthode simple — outil gratuit type Wave Accounting ou équivalent",
        why: "Avoir une gestion claire et simple de son activité à l'étranger permet que tout soit géré depuis la structure juridique et non en nom propre",
      },
      {
        action: "Connaître tes obligations annuelles",
        how: "Renseigne-toi sur les obligations annuelles de ta structure — certaines structures ont des déclarations comptables obligatoires avec des deadlines strictes",
        why: "Des pénalités lourdes en cas d'oubli ou d'erreur peuvent coûter très cher — mieux vaut les anticiper dès la création",
      },
      {
        action: "Se renseigner sur la TVA",
        how: "Selon ton activité et tes clients — BtoB ou BtoC — et selon certains seuils de chiffre d'affaires, tu peux avoir des obligations de collecte de TVA",
        why: "Ignorer ses obligations TVA peut entraîner des redressements — un point à clarifier dès le départ avec ton prestataire",
      },
      {
        action: "Documenter ta substance économique",
        how: "La substance économique c'est la preuve que ton entreprise existe vraiment — contrats signés au nom de ta structure, décisions prises via ta structure, compte bancaire pro actif, facturation propre",
        why: "Sans substance économique tu risques d'être requalifié en Permanent Establishment par le fisc",
      },
    ],
    result: "Tu sais exactement via quelle entité tu factures, sur quel compte tu encaisses, et quelles sont tes obligations chaque année. Zéro flou.",
  },
  {
    number: 4,
    title: "COUPE LES PONTS AVEC LA FRANCE",
    subtitle: "L'étape la plus importante — et la plus souvent mal faite",
    milestone: "Jalon M+3 à M+6",
    rows: [
      {
        action: "Lister tout ce que tu as en France",
        how: "Fais l'inventaire complet de ta situation actuelle — activité professionnelle, société, résidence principale, biens immobiliers, comptes bancaires, patrimoine",
        why: "C'est le point de départ — impossible de planifier ta sortie sans savoir exactement d'où tu pars",
      },
      {
        action: "Comprendre ce qui te maintient résident fiscal en France",
        how: "Informe-toi sur les 3 critères de l'article 4B du CGI — foyer ou lieu de séjour principal, activité professionnelle principale, centre des intérêts économiques. Un seul critère suffit pour rester résident fiscal français",
        why: "Comprendre ces critères te permet de savoir exactement ce qui te maintient résident fiscal français et donc ce que tu dois changer",
      },
      {
        action: "Statuer sur le sort de chaque élément",
        how: "Pour chaque élément identifié décide de son sort — revente ou mise en location de la résidence principale, mise en veille ou fermeture de la société, migration de l'activité à l'étranger",
        why: "C'est en réglant chaque élément dans le bon ordre que tu peux sortir proprement de la résidence fiscale française",
      },
      {
        action: "Comprendre ce qui restera imposable en France",
        how: "Renseigne-toi sur les revenus qui restent imposables en France même en tant que non-résident — revenus fonciers sur un bien immobilier français, plus-values immobilières",
        why: "Même non-résident certains revenus restent imposables en France — les anticiper évite les mauvaises surprises",
      },
      {
        action: "Planifier le timing de ta sortie",
        how: "Définis la date à partir de laquelle tu ne cocheras plus aucun critère de résidence fiscale française et à partir de laquelle tu cocheras les critères de résidence fiscale thaïlandaise",
        why: "L'ordre et le timing sont cruciaux — une mauvaise séquence peut te maintenir résident fiscal français sans que tu le réalises",
      },
      {
        action: "Préparer ses déclarations fiscales",
        how: "Renseigne-toi sur les formulaires et les règles pour sortir officiellement de France — dernière déclaration en tant que résident, premières déclarations en tant que non-résident",
        why: "Deux logiques fiscales différentes — bien les distinguer pour ne pas faire d'erreur",
      },
      {
        action: "Notifier officiellement ton départ",
        how: "Se renseigner sur la procédure officielle de notification de départ auprès du fisc français. Cette démarche est à faire après avoir établi ta résidence à l'étranger et non avant",
        why: "C'est l'étape qui officialise ton changement de statut fiscal",
      },
    ],
    result: "Tu n'es plus résident fiscal français. Ta situation est documentée et solide. Personne ne peut te requalifier.",
  },
  {
    number: 5,
    title: "COMPRENDS TA FISCALITÉ",
    subtitle: "Savoir exactement ce que tu paies, où et pourquoi",
    milestone: "Jalon M+6 à M+12",
    rows: [
      {
        action: "Comprendre le principe de base de la fiscalité thaïlandaise",
        how: "Renseigne-toi sur le principe de territorialité — en Thaïlande tu ne paies des impôts que sur ce que tu gagnes et importes localement. Pas sur tes revenus mondiaux",
        why: "C'est l'avantage fiscal principal de la Thaïlande — comprendre ce principe c'est comprendre pourquoi des entrepreneurs choisissent de s'y installer",
      },
      {
        action: "Comprendre la réforme fiscale 2024",
        how: "Depuis janvier 2024 tout argent importé en Thaïlande peut être imposable selon les conditions dans lesquelles il est rapatrié — renseigne-toi sur les règles en vigueur",
        why: "Les règles ont changé — ignorer la réforme 2024 peut entraîner une imposition surprise sur des revenus que tu pensais non taxables",
      },
      {
        action: "Organiser ce que tu importes en Thaïlande",
        how: "Réfléchis à ce que tu rapatries en Thaïlande — salaire, distributions, épargne — et organise tes flux en conséquence",
        why: "Tu contrôles ce que tu importes et donc ce qui est potentiellement imposable localement — c'est ton principal levier d'optimisation fiscale",
      },
      {
        action: "Comprendre ce qui reste imposable en France",
        how: "Identifie tes revenus résiduels de source française — revenus fonciers, plus-values immobilières — et renseigne-toi sur la convention fiscale France-Thaïlande",
        why: "La convention fiscale France-Thaïlande définit qui peut imposer quoi — indispensable si tu as encore des revenus de source française",
      },
      {
        action: "Obtenir ton identifiant fiscal thaïlandais",
        how: "Renseigne-toi sur les démarches pour obtenir ton Tax ID thaïlandais auprès du Revenue Department",
        why: "Sans Tax ID tu ne peux pas déclarer officiellement tes revenus en Thaïlande ni bénéficier des conventions fiscales",
      },
      {
        action: "Préparer ta première déclaration annuelle",
        how: "Renseigne-toi sur les formulaires de déclaration annuelle thaïlandais et les deadlines à respecter",
        why: "La déclaration annuelle thaïlandaise c'est une obligation dès lors que tu es résident fiscal — mieux vaut s'y préparer avant la première échéance",
      },
    ],
    result: "Tu sais exactement où tu paies tes impôts et sur quoi. Pas de double imposition, pas de mauvaise surprise.",
  },
  {
    number: 6,
    title: "ORGANISE TON SYSTÈME BANCAIRE",
    subtitle: "Un système simple, clair et sans risque",
    milestone: "Jalon M+1 à M+3",
    rows: [
      {
        action: "Faire l'inventaire de tous tes comptes actuels",
        how: "Liste tous tes comptes existants — comptes perso, comptes pro, épargne, PEA, assurance vie — et définis le rôle de chacun dans ta nouvelle vie",
        why: "Avant de réorganiser tu dois savoir exactement ce que tu as et ce que tu vas en faire",
      },
      {
        action: "Définir ton architecture bancaire cible",
        how: "Réfléchis à l'organisation idéale — un compte pro au nom de ta structure pour tes revenus clients, un compte perso international pour tes dépenses courantes, un compte français en backup minimal",
        why: "Avoir une architecture claire c'est savoir exactement où va chaque euro — ça simplifie ta comptabilité et protège ta substance économique",
      },
      {
        action: "Ouvrir un compte bancaire pro au nom de ta structure",
        how: "Choisis la solution bancaire adaptée à ta structure et à tes clients — Wise Business, Revolut Business, Mercury, Payoneer. Vérifie la compatibilité avec les plateformes que tu utilises",
        why: "C'est sur ce compte que tes clients te paient — jamais sur ton compte perso",
      },
      {
        action: "Ouvrir un compte perso international",
        how: "Wise ou Revolut sont les options les plus adaptées pour un expatrié — multi-devises, frais réduits, carte internationale",
        why: "Pour gérer tes dépenses quotidiennes à l'international sans frais excessifs",
      },
      {
        action: "Gérer ton compte français",
        how: "Ne le ferme pas immédiatement — garde-le en backup minimal pour tes obligations résiduelles françaises. Vide-le progressivement",
        why: "Fermer son compte français trop vite peut créer des complications pour tes dernières obligations fiscales",
      },
      {
        action: "Appliquer la règle pro/perso strictement",
        how: "Ne mélange jamais tes dépenses personnelles et professionnelles — tout ce qui est pro passe par le compte de ta structure, tout ce qui est perso passe par ton compte perso",
        why: "Mélanger pro et perso affaiblit ta substance économique et complique ta comptabilité",
      },
    ],
    result: "Ton argent circule proprement de la facture client jusqu'à ta vie quotidienne à Bangkok. Ton système tient face à n'importe quel contrôle.",
  },
]

// ── Checklist ──
export const checklist: ChecklistCategory[] = [
  {
    emoji: '🎯',
    title: 'Projet',
    items: [
      'Définir pourquoi je veux partir',
      'Lister ce qui est important pour moi',
      'Identifier mes non-négociables',
      'Définir mon modèle de vie cible dans 2 ans',
      'Identifier mes contraintes réelles',
    ],
  },
  {
    emoji: '🇹🇭',
    title: 'Installation',
    items: [
      'Choisir ma ville de vie',
      'Identifier le bon visa pour mon profil',
      'Vérifier la cohérence visa et activité',
      'Estimer mon budget de vie réel',
      'Trouver un logement avec contrat de bail',
    ],
  },
  {
    emoji: '💼',
    title: 'Structure juridique',
    items: [
      "Définir mon type d'activité",
      'Choisir la structure adaptée à mon profil',
      'Choisir et contacter un prestataire sérieux',
      "Créer ma structure à l'étranger",
      'Ouvrir mon compte bancaire pro',
      'Mettre en place ma facturation',
      'Mettre en place ma comptabilité',
      'Connaître mes obligations annuelles',
      'Me renseigner sur mes obligations TVA',
      'Documenter ma substance économique',
    ],
  },
  {
    emoji: '🇫🇷',
    title: 'Sortie de France',
    items: [
      "Lister tout ce que j'ai en France",
      'Comprendre les 3 critères de résidence fiscale française',
      'Statuer sur le sort de chaque élément',
      'Comprendre ce qui restera imposable en France',
      'Planifier le timing de ma sortie fiscale',
      'Préparer mes déclarations fiscales',
      'Notifier officiellement mon départ',
    ],
  },
  {
    emoji: '💰',
    title: 'Fiscalité',
    items: [
      'Comprendre le principe de territorialité thaïlandaise',
      'Comprendre la réforme fiscale 2024',
      "Organiser ce que j'importe en Thaïlande",
      'Comprendre ce qui reste imposable en France',
      'Obtenir mon Tax ID thaïlandais',
      'Préparer ma première déclaration thaïlandaise',
    ],
  },
  {
    emoji: '🏦',
    title: 'Système bancaire',
    items: [
      "Faire l'inventaire de tous mes comptes actuels",
      'Définir mon architecture bancaire cible',
      'Ouvrir un compte bancaire pro au nom de ma structure',
      'Ouvrir un compte perso international',
      'Gérer mon compte français en backup',
      'Appliquer la règle pro/perso strictement',
    ],
  },
]
