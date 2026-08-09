export type Language = "en" | "fr";

type TranslationSet = {
  common: {
    unexpectedError: string;
    back: string;
    quit: string;
  };
  home: {
    tagline: string;
    createLobby: string;
    howToPlay: string;
    players: string;
    feedback: string;
    welcomeBack: string;
    friends: string;
    logOut: string;
    dontLoseStories: string;
    logIn: string;
    signIn: string;
  };
  joinLobbyButton: {
    joinLobby: string;
    go: string;
  };
  howToPlay: {
    title: string;
    subtitle: string;
    section1Title: string;
    section1Body: string;
    section2Title: string;
    section2Body: string;
    section3Title: string;
    section3Body: string;
    section4Title: string;
    section4Body: string;
  };
  login: {
    title: string;
    subtitle: string;
    emailPlaceholder: string;
    passwordPlaceholder: string;
    incorrectCredentials: string;
    connecting: string;
    logIn: string;
    noAccount: string;
    signIn: string;
  };
  signup: {
    title: string;
    subtitle: string;
    namePlaceholder: string;
    emailPlaceholder: string;
    passwordPlaceholder: string;
    invalidForm: string;
    creating: string;
    createAccount: string;
    alreadyAccount: string;
    logIn: string;
  };
  createLobby: {
    title: string;
    subtitle: string;
    playerName: string;
    yourPseudo: string;
    gameName: string;
    optional: string;
    numberOfPlayers: string;
    fewerPlayers: string;
    morePlayers: string;
    numberOfQuestions: string;
    custom: string;
    language: string;
    french: string;
    english: string;
    category: string;
    creating: string;
    createLobby: string;
  };
  joinLobby: {
    title: string;
    subtitle: string;
    lobbyCode: string;
    playerName: string;
    yourPseudo: string;
    joining: string;
    joinLobby: string;
  };
  waitingRoom: {
    lobbyCode: string;
    copied: string;
    tapToCopy: string;
    you: string;
    host: string;
    logInToAddFriends: string;
    friendAdded: string;
    addFriend: string;
    kick: string;
    readyLabel: string;
    notReadyLabel: string;
    waitingForOthers: string;
    readyButton: string;
    storyStartsHint: string;
    startNow: string;
    starting: string;
  };
  play: {
    question: (round: number, total: number) => string;
    waitingTitle: string;
    waitingSubtitle: string;
    stillWriting: (names: string) => string;
    answerPlaceholder: string;
    sending: string;
    submit: string;
    hostSomeoneStuck: string;
    remove: string;
  };
  results: {
    title: string;
    notReady: string;
    storyOf: (pseudo: string) => string;
    backToHome: string;
    playAgain: string;
    creating: string;
  };
  friends: {
    title: string;
    logInToManage: string;
    logIn: string;
    byEmail: string;
    byPlayerId: string;
    friendEmailPlaceholder: string;
    add: string;
    friendIdPlaceholder: string;
    noFriendsYet: string;
  };
  profile: {
    title: string;
    logInToSee: string;
    logIn: string;
    level: (level: number) => string;
    friends: string;
    gamesPlayed: string;
    achievements: string;
    avatarUrl: string;
    bio: string;
    bioPlaceholder: string;
    cancel: string;
    save: string;
    saving: string;
    noBioYet: string;
    editProfile: string;
    copyPlayerId: string;
  };
  achievements: {
    title: string;
    logInToSee: string;
    logIn: string;
  };
  achievementInfo: {
    FIRST_STORY: { title: string; description: string };
    FIRST_FRIEND: { title: string; description: string };
    ACCOMPLICE: { title: string; description: (n: number) => string };
    STORY_LIKED: { title: string; description: string };
    STORYTELLER: { title: string; description: (n: number) => string };
    SOCIAL_BUTTERFLY: { title: string; description: (n: number) => string };
    CROWD_PLEASER: { title: string; description: (n: number) => string };
    WORDSMITH: { title: string; description: (n: number) => string };
    LEVEL_10: { title: string; description: string };
    LEVEL_30: { title: string; description: string };
    LEVEL_50: { title: string; description: string };
    LEVEL_100: { title: string; description: string };
  };
};

export const translations: Record<Language, TranslationSet> = {
  en: {
    common: {
      unexpectedError: "Unexpected error",
      back: "Back",
      quit: "Quit",
    },
    home: {
      tagline: "Create ridiculous stories with your friends.",
      createLobby: "Create lobby",
      howToPlay: "How to play ?",
      players: "2 to 12 players",
      feedback: "Give me feedback",
      welcomeBack: "Welcome back,",
      friends: "Friends",
      logOut: "Log out",
      dontLoseStories: "Don't lose your stories",
      logIn: "Log in",
      signIn: "Sign in",
    },
    joinLobbyButton: {
      joinLobby: "Join lobby",
      go: "Go",
    },
    howToPlay: {
      title: "How to play",
      subtitle: 'A classic "exquisite corpse" story game, 2 to 12 players.',
      section1Title: "1. Gather your friends",
      section1Body:
        "One player creates a lobby, picks a question category and how many rounds to play, then shares the lobby code. Everyone else joins with that code and a name.",
      section2Title: "2. Ready up",
      section2Body:
        "Once everyone has marked themselves ready, the story begins — each player starts their own story sheet.",
      section3Title: "3. Write, pass, repeat",
      section3Body:
        "Every round, everyone answers the same kind of question (who, where, what...) on a different player's story — without seeing what was written before. The sheet passes to the next player each round, so nobody sees the full story until the end.",
      section4Title: "4. Read the results",
      section4Body:
        "Once every round is done, all the stories are revealed — stitched together from everyone's answers, usually with hilarious results.",
    },
    login: {
      title: "Log in",
      subtitle: "Glad to see you again.",
      emailPlaceholder: "Email",
      passwordPlaceholder: "Password",
      incorrectCredentials: "Incorrect email or password",
      connecting: "Connecting...",
      logIn: "Log in",
      noAccount: "No account yet?",
      signIn: "Sign in",
    },
    signup: {
      title: "Sign in",
      subtitle: "Create your account so you never lose your stories.",
      namePlaceholder: "Nickname",
      emailPlaceholder: "Email",
      passwordPlaceholder: "Password (8 characters min.)",
      invalidForm: "Invalid form",
      creating: "Creating...",
      createAccount: "Create my account",
      alreadyAccount: "Already have an account?",
      logIn: "Log in",
    },
    createLobby: {
      title: "Create lobby",
      subtitle: "Set up your story before you invite friends.",
      playerName: "Player Name",
      yourPseudo: "Your pseudo",
      gameName: "Game Name",
      optional: "Optional",
      numberOfPlayers: "Number Of Players",
      fewerPlayers: "Fewer players",
      morePlayers: "More players",
      numberOfQuestions: "Number Of Questions",
      custom: "Custom",
      language: "Language",
      french: "Français",
      english: "English",
      category: "Category",
      creating: "Creating...",
      createLobby: "Create lobby",
    },
    joinLobby: {
      title: "Join lobby",
      subtitle:
        "Enter the code your friend shared with you. Already playing? Use the same name to rejoin.",
      lobbyCode: "Lobby Code",
      playerName: "Player Name",
      yourPseudo: "Your pseudo",
      joining: "Joining...",
      joinLobby: "Join lobby",
    },
    waitingRoom: {
      lobbyCode: "Lobby code",
      copied: "Copied!",
      tapToCopy: "Tap to copy",
      you: " (you)",
      host: "host",
      logInToAddFriends: "Log in to add friends",
      friendAdded: "Friend added",
      addFriend: "Add friend",
      kick: "kick",
      readyLabel: "Ready",
      notReadyLabel: "Not ready",
      waitingForOthers: "Waiting for other players…",
      readyButton: "Ready",
      storyStartsHint: "The story starts once everyone is ready.",
      startNow: "Start now (skip waiting for ready)",
      starting: "Starting...",
    },
    play: {
      question: (round: number, total: number) => `Question ${round} / ${total}`,
      waitingTitle: "Waiting for the others...",
      waitingSubtitle: "The story continues once everyone has answered.",
      stillWriting: (names: string) => `Still writing: ${names}`,
      answerPlaceholder: "Your answer",
      sending: "Sending...",
      submit: "Submit",
      hostSomeoneStuck: "Host: someone stuck?",
      remove: "remove",
    },
    results: {
      title: "The stories",
      notReady: "The stories aren't ready yet.",
      storyOf: (pseudo: string) => `${pseudo}'s story`,
      backToHome: "Back to home",
      playAgain: "Play again",
      creating: "Creating...",
    },
    friends: {
      title: "Friends",
      logInToManage: "to manage your friends.",
      logIn: "Log in",
      byEmail: "By email",
      byPlayerId: "By player ID",
      friendEmailPlaceholder: "Friend's email",
      add: "Add",
      friendIdPlaceholder: "Friend's player ID",
      noFriendsYet: "No friends yet — add one above.",
    },
    profile: {
      title: "Profile",
      logInToSee: "to see your profile.",
      logIn: "Log in",
      level: (level: number) => `Level ${level}`,
      friends: "Friends",
      gamesPlayed: "Games played",
      achievements: "Achievements",
      avatarUrl: "Avatar URL",
      bio: "Bio",
      bioPlaceholder: "Tell your friends about yourself",
      cancel: "Cancel",
      save: "Save",
      saving: "Saving...",
      noBioYet: "No bio yet.",
      editProfile: "Edit profile",
      copyPlayerId: "Copy player ID",
    },
    achievements: {
      title: "Achievements",
      logInToSee: "to see your achievements.",
      logIn: "Log in",
    },
    achievementInfo: {
      FIRST_STORY: { title: "First story", description: "Finish your first game" },
      FIRST_FRIEND: { title: "Made a friend", description: "Add your first friend" },
      ACCOMPLICE: {
        title: "Accomplice",
        description: (n: number) => `Finish ${n} games with the same friend`,
      },
      STORY_LIKED: { title: "Crowd favorite", description: "Get one of your stories liked" },
      STORYTELLER: { title: "Storyteller", description: (n: number) => `Finish ${n} games` },
      SOCIAL_BUTTERFLY: {
        title: "Social butterfly",
        description: (n: number) => `Add ${n} friends`,
      },
      CROWD_PLEASER: {
        title: "Crowd pleaser",
        description: (n: number) => `Get ${n} likes on your stories`,
      },
      WORDSMITH: { title: "Wordsmith", description: (n: number) => `Write ${n} answers` },
      LEVEL_10: { title: "Rising star", description: "Reach level 10" },
      LEVEL_30: { title: "Seasoned", description: "Reach level 30" },
      LEVEL_50: { title: "Master storyteller", description: "Reach level 50" },
      LEVEL_100: { title: "Legend", description: "Reach level 100" },
    },
  },
  fr: {
    common: {
      unexpectedError: "Erreur inattendue",
      back: "Retour",
      quit: "Quitter",
    },
    home: {
      tagline: "Crée des histoires délirantes avec tes amis.",
      createLobby: "Créer une partie",
      howToPlay: "Comment jouer ?",
      players: "2 à 12 joueurs",
      feedback: "Donne-moi ton avis",
      welcomeBack: "Content de te revoir,",
      friends: "Amis",
      logOut: "Se déconnecter",
      dontLoseStories: "Ne perds plus tes histoires",
      logIn: "Se connecter",
      signIn: "S'inscrire",
    },
    joinLobbyButton: {
      joinLobby: "Rejoindre une partie",
      go: "OK",
    },
    howToPlay: {
      title: "Comment jouer",
      subtitle: "Un cadavre exquis classique, de 2 à 12 joueurs.",
      section1Title: "1. Réunis tes amis",
      section1Body:
        "Un joueur crée une partie, choisit une catégorie de questions et le nombre de tours à jouer, puis partage le code de la partie. Les autres rejoignent avec ce code et un nom.",
      section2Title: "2. Prêt à jouer",
      section2Body:
        "Une fois que tout le monde s'est déclaré prêt, l'histoire commence — chaque joueur démarre sa propre feuille d'histoire.",
      section3Title: "3. Écris, fais tourner, recommence",
      section3Body:
        "À chaque tour, tout le monde répond au même type de question (qui, où, quoi...) sur l'histoire d'un autre joueur — sans voir ce qui a été écrit avant. La feuille passe au joueur suivant à chaque tour, donc personne ne voit l'histoire complète avant la fin.",
      section4Title: "4. Découvre les résultats",
      section4Body:
        "Une fois tous les tours terminés, toutes les histoires sont révélées — assemblées à partir des réponses de chacun, souvent avec des résultats hilarants.",
    },
    login: {
      title: "Se connecter",
      subtitle: "Content de te revoir.",
      emailPlaceholder: "Email",
      passwordPlaceholder: "Mot de passe",
      incorrectCredentials: "Email ou mot de passe incorrect",
      connecting: "Connexion...",
      logIn: "Se connecter",
      noAccount: "Pas encore de compte ?",
      signIn: "S'inscrire",
    },
    signup: {
      title: "S'inscrire",
      subtitle: "Crée ton compte pour ne plus perdre tes histoires.",
      namePlaceholder: "Pseudo",
      emailPlaceholder: "Email",
      passwordPlaceholder: "Mot de passe (8 caractères min.)",
      invalidForm: "Formulaire invalide",
      creating: "Création...",
      createAccount: "Créer mon compte",
      alreadyAccount: "Déjà un compte ?",
      logIn: "Se connecter",
    },
    createLobby: {
      title: "Créer une partie",
      subtitle: "Configure ton histoire avant d'inviter tes amis.",
      playerName: "Nom du joueur",
      yourPseudo: "Ton pseudo",
      gameName: "Nom de la partie",
      optional: "Facultatif",
      numberOfPlayers: "Nombre de joueurs",
      fewerPlayers: "Moins de joueurs",
      morePlayers: "Plus de joueurs",
      numberOfQuestions: "Nombre de questions",
      custom: "Personnalisé",
      language: "Langue",
      french: "Français",
      english: "English",
      category: "Catégorie",
      creating: "Création...",
      createLobby: "Créer une partie",
    },
    joinLobby: {
      title: "Rejoindre une partie",
      subtitle:
        "Entre le code que ton ami t'a partagé. Déjà en train de jouer ? Utilise le même nom pour revenir.",
      lobbyCode: "Code de la partie",
      playerName: "Nom du joueur",
      yourPseudo: "Ton pseudo",
      joining: "Connexion...",
      joinLobby: "Rejoindre",
    },
    waitingRoom: {
      lobbyCode: "Code de la partie",
      copied: "Copié !",
      tapToCopy: "Toucher pour copier",
      you: " (toi)",
      host: "hôte",
      logInToAddFriends: "Connecte-toi pour ajouter des amis",
      friendAdded: "Ami ajouté",
      addFriend: "Ajouter en ami",
      kick: "exclure",
      readyLabel: "Prêt",
      notReadyLabel: "Pas prêt",
      waitingForOthers: "En attente des autres joueurs…",
      readyButton: "Prêt",
      storyStartsHint: "L'histoire commence une fois que tout le monde est prêt.",
      startNow: "Démarrer maintenant (sans attendre)",
      starting: "Démarrage...",
    },
    play: {
      question: (round: number, total: number) => `Question ${round} / ${total}`,
      waitingTitle: "En attente des autres...",
      waitingSubtitle: "L'histoire continue une fois que tout le monde a répondu.",
      stillWriting: (names: string) => `En train d'écrire : ${names}`,
      answerPlaceholder: "Ta réponse",
      sending: "Envoi...",
      submit: "Envoyer",
      hostSomeoneStuck: "Hôte : quelqu'un est bloqué ?",
      remove: "retirer",
    },
    results: {
      title: "Les histoires",
      notReady: "Les histoires ne sont pas encore prêtes.",
      storyOf: (pseudo: string) => `L'histoire de ${pseudo}`,
      backToHome: "Retour à l'accueil",
      playAgain: "Rejouer",
      creating: "Création...",
    },
    friends: {
      title: "Amis",
      logInToManage: "pour gérer tes amis.",
      logIn: "Se connecter",
      byEmail: "Par email",
      byPlayerId: "Par identifiant",
      friendEmailPlaceholder: "Email de ton ami",
      add: "Ajouter",
      friendIdPlaceholder: "Identifiant de ton ami",
      noFriendsYet: "Pas encore d'amis — ajoute-en un ci-dessus.",
    },
    profile: {
      title: "Profil",
      logInToSee: "pour voir ton profil.",
      logIn: "Se connecter",
      level: (level: number) => `Niveau ${level}`,
      friends: "Amis",
      gamesPlayed: "Parties jouées",
      achievements: "Succès",
      avatarUrl: "URL de l'avatar",
      bio: "Bio",
      bioPlaceholder: "Parle de toi à tes amis",
      cancel: "Annuler",
      save: "Enregistrer",
      saving: "Enregistrement...",
      noBioYet: "Pas encore de bio.",
      editProfile: "Modifier le profil",
      copyPlayerId: "Copier l'identifiant du joueur",
    },
    achievements: {
      title: "Succès",
      logInToSee: "pour voir tes succès.",
      logIn: "Se connecter",
    },
    achievementInfo: {
      FIRST_STORY: { title: "Première histoire", description: "Termine ta première partie" },
      FIRST_FRIEND: { title: "Premier ami", description: "Ajoute ton premier ami" },
      ACCOMPLICE: {
        title: "Complice",
        description: (n: number) => `Termine ${n} parties avec le même ami`,
      },
      STORY_LIKED: { title: "Chouchou du public", description: "Reçois un like sur une de tes histoires" },
      STORYTELLER: { title: "Conteur", description: (n: number) => `Termine ${n} parties` },
      SOCIAL_BUTTERFLY: {
        title: "Papillon social",
        description: (n: number) => `Ajoute ${n} amis`,
      },
      CROWD_PLEASER: {
        title: "Chouchou de la foule",
        description: (n: number) => `Reçois ${n} likes sur tes histoires`,
      },
      WORDSMITH: { title: "Plume affûtée", description: (n: number) => `Écris ${n} réponses` },
      LEVEL_10: { title: "Étoile montante", description: "Atteins le niveau 10" },
      LEVEL_30: { title: "Aguerri", description: "Atteins le niveau 30" },
      LEVEL_50: { title: "Maître conteur", description: "Atteins le niveau 50" },
      LEVEL_100: { title: "Légende", description: "Atteins le niveau 100" },
    },
  },
};
