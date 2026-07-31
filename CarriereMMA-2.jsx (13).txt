import { useState, useEffect } from "react";

// ================= DATA =================

const ORGS = [
  { id: "hexagone", name: "Hexagone MMA", region: "France", minAge: 18, tier: 1, repReq: 0, payMult: 1.0, repMult: 1.0 },
  { id: "cagewarriors", name: "Cage Warriors", region: "UK/Irlande", minAge: 18, tier: 1, repReq: 0, payMult: 1.1, repMult: 1.1 },
  { id: "lfa", name: "LFA", region: "USA", minAge: 18, tier: 1, repReq: 5, payMult: 1.0, repMult: 1.2 },
  { id: "titanfc", name: "Titan FC", region: "USA", minAge: 18, tier: 1, repReq: 3, payMult: 1.05, repMult: 1.05 },
  { id: "efc", name: "EFC", region: "Afrique du Sud", minAge: 18, tier: 1, repReq: 2, payMult: 1.0, repMult: 1.1 },
  { id: "furyfc", name: "Fury FC", region: "USA", minAge: 18, tier: 1, repReq: 6, payMult: 1.1, repMult: 1.1 },
  { id: "shooto", name: "Shooto", region: "Japon", minAge: 18, tier: 1, repReq: 8, payMult: 1.15, repMult: 1.15 },
  { id: "oktagon", name: "Oktagon MMA", region: "Tchéquie/Slovaquie", minAge: 18, tier: 2, repReq: 18, payMult: 1.4, repMult: 1.2 },
  { id: "ksw", name: "KSW", region: "Pologne", minAge: 18, tier: 2, repReq: 22, payMult: 1.6, repMult: 1.3 },
  { id: "fng", name: "Fight Nights Global", region: "Russie", minAge: 18, tier: 2, repReq: 16, payMult: 1.35, repMult: 1.2 },
  { id: "m1global", name: "M-1 Global", region: "Russie", minAge: 18, tier: 2, repReq: 20, payMult: 1.4, repMult: 1.25 },
  { id: "aca", name: "ACA", region: "Russie/Caucase", minAge: 18, tier: 2, repReq: 24, payMult: 1.5, repMult: 1.25 },
  { id: "bravecf", name: "BRAVE CF", region: "Bahreïn/Moyen-Orient", minAge: 18, tier: 2, repReq: 19, payMult: 1.45, repMult: 1.3 },
  { id: "roadfc", name: "Road FC", region: "Corée du Sud", minAge: 18, tier: 2, repReq: 21, payMult: 1.4, repMult: 1.2 },
  { id: "combateglobal", name: "Combate Global", region: "Amérique latine/USA", minAge: 18, tier: 2, repReq: 23, payMult: 1.5, repMult: 1.25 },
  { id: "rizin", name: "RIZIN", region: "Japon", minAge: 18, tier: 3, repReq: 38, payMult: 1.9, repMult: 1.3 },
  { id: "one", name: "ONE Championship", region: "Asie", minAge: 18, tier: 3, repReq: 42, payMult: 2.0, repMult: 1.4 },
  { id: "bellator", name: "Bellator", region: "USA/Europe", minAge: 18, tier: 3, repReq: 45, payMult: 2.1, repMult: 1.4 },
  { id: "pfl", name: "PFL", region: "USA", minAge: 18, tier: 4, repReq: 55, payMult: 2.6, repMult: 1.6 },
  { id: "ufc", name: "UFC", region: "USA", minAge: 21, tier: 5, repReq: 72, payMult: 4.2, repMult: 2.0 },
];

const DWCS = { id: "dwcs", name: "Dana White's Contender Series", region: "APEX, Las Vegas", tier: 4.5 };

const GYMS = [
  { id: "quartier", name: "Salle de quartier", cost: 0, skill: 1.0, heal: 1.0, risk: 1.05, desc: "Gratuit, ambiance familiale, encadrement limité." },
  { id: "regional", name: "Camp régional élite", cost: 8000, skill: 1.25, heal: 1.1, risk: 0.95, desc: "Bons sparring-partners, suivi sérieux." },
  { id: "usa", name: "Camp façon American Top Team", cost: 25000, skill: 1.55, heal: 1.2, risk: 0.85, desc: "Standard international, préparation pointue." },
  { id: "intl", name: "Camp international (Thaïlande / Las Vegas)", cost: 60000, skill: 1.9, heal: 1.3, risk: 0.75, desc: "Le sommet de la préparation, très coûteux." },
];

// ---- Patrimoine : investissements durables financés par les bourses de carrière. Distincts du
// choix de salle d'entraînement (GYMS, un abonnement qu'on change), ce sont des actifs achetés une
// fois pour toutes qui changent structurellement les finances et la récupération. ----
const INVESTMENTS = [
  { id:"own_gym", label:"🏋️ Salle de sport personnelle", cost:180000,
    desc:"Réduit le coût mensuel de ton staff de 25% et génère un revenu passif chaque semaine (loyers de licence, cours donnés aux amateurs).",
    incomeRange:[40,90] },
  { id:"medical_team", label:"⚕️ Équipe médicale dédiée", cost:120000,
    desc:"Kinés et médecins attitrés à ton coin : réduit d'environ 20% la durée de toutes tes convalescences après blessure.",
    recoveryMult:0.8 },
];
function hasInvestment(s, id){ return (s.investments||[]).includes(id); }
function investmentById(id){ return INVESTMENTS.find(i=>i.id===id); }

// ---- Camps d'entraînement à l'étranger : boostent une discipline précise, ponctuellement ----
// Chaque camp consomme un cycle (comme un repos), coûte cher, mais fait grimper une stat ciblée
// bien plus qu'un cycle classique, et fait parfois découvrir un membre de staff spécialisé sur place.
const TRAINING_CAMPS = [
  { id:"russia_lutte", name:"Camp en Russie", country:"Russie", focus:"lutte", cost:14000, boost:[7,12], weeksCost:4,
    desc:"Sambo et lutte façon Daghestan : contrôle et cadenas implacables.", staffId:"coach_lutte_russe" },
  { id:"brazil_bjj", name:"Camp au Brésil", country:"Brésil", focus:"grappling", cost:13000, boost:[7,12], weeksCost:4,
    desc:"Jiu-jitsu brésilien intensif, jeu de garde et soumissions.", staffId:"coach_bjj_bresilien" },
  { id:"thailand_muaythai", name:"Camp en Thaïlande", country:"Thaïlande", focus:"boxe", cost:15000, boost:[7,12], weeksCost:4,
    desc:"Muay Thai traditionnel : coudes, genoux et low kicks au menu.", staffId:"coach_muaythai" },
  { id:"usa_strength", name:"Camp aux USA", country:"USA", focus:"cardio", cost:16000, boost:[7,12], weeksCost:4,
    desc:"Préparation physique façon force & conditionnement américain.", staffId:"prepa_physique_us" },
  { id:"japan_mental", name:"Camp au Japon", country:"Japon", focus:"mental", cost:11000, boost:[6,11], weeksCost:3,
    desc:"Discipline et rigueur : dojo traditionnel, travail du mental.", staffId:"maitre_mental_japonais" },
  { id:"gb_boxing", name:"Camp au Royaume-Uni", country:"Royaume-Uni", focus:"chin", cost:12000, boost:[6,11], weeksCost:3,
    desc:"Boxe anglaise pure : encaisser, esquiver, tenir la distance.", staffId:"coach_boxe_anglaise" },
];

// ---- Staff spécialisé : embauchable au mois, découvert au fil de la carrière ----
// effect: skillFocus (discipline boostée en priorité), skillBonus (points ajoutés aux gains de skill),
// healthRegen (bonus de récup en repos), injuryReduce (réduction multiplicative du risque de blessure),
// hypeBonus (gain de hype passif), reputationBonus (bonus de réputation sur victoire), moralBonus (moral en repos).
const STAFF_SPECIALISTS = [
  { id:"coach_lutte_russe", name:"Coach de lutte/sambo russe", role:"Lutte", cost:1300, effect:{ skillFocus:"lutte", skillBonus:0.5 }, desc:"Affine ton contrôle et tes enchaînements de lutte." },
  { id:"coach_bjj_bresilien", name:"Professeur BJJ black belt", role:"Grappling", cost:1300, effect:{ skillFocus:"grappling", skillBonus:0.5 }, desc:"Peaufine ton jeu de soumission au sol." },
  { id:"coach_muaythai", name:"Coach de Muay Thai", role:"Frappe", cost:1300, effect:{ skillFocus:"boxe", skillBonus:0.5 }, desc:"Ajoute de la variété et de la puissance à ta frappe." },
  { id:"prepa_physique_us", name:"Préparateur physique", role:"Cardio", cost:1000, effect:{ cardioBonus:0.6, healthRegen:1.5 }, desc:"Améliore ton cardio et ta récupération générale." },
  { id:"maitre_mental_japonais", name:"Maître de préparation mentale", role:"Mental", cost:900, effect:{ mentalBonus:0.6, moralBonus:1.5 }, desc:"Renforce ton sang-froid et ton équilibre moral." },
  { id:"coach_boxe_anglaise", name:"Coach de boxe anglaise", role:"Chin/défense", cost:1000, effect:{ chinBonus:0.5, injuryReduce:0.08 }, desc:"Travaille ta garde et ta capacité à encaisser." },
  { id:"nutritionniste", name:"Nutritionniste sportif", role:"Santé", cost:900, effect:{ healthRegen:2.0, injuryReduce:0.05 }, desc:"Optimise ta récupération et limite les blessures." },
  { id:"attache_presse", name:"Attaché(e) de presse", role:"Médias", cost:1200, effect:{ hypeBonus:2.5, reputationBonus:0.6 }, desc:"Travaille ton image et gonfle la hype autour de tes combats." },
  { id:"analyste_video", name:"Analyste vidéo", role:"Stratégie", cost:1000, effect:{ winChanceBonus:2.5 }, desc:"Décortique les adversaires pour affiner ton plan de jeu." },
];
function staffEffect(hiredIds, key){
  return (hiredIds||[]).reduce((total, id)=>{
    const spec = STAFF_SPECIALISTS.find(s=>s.id===id);
    return total + (spec && spec.effect[key] ? spec.effect[key] : 0);
  }, 0);
}
function staffMonthlyCost(hiredIds){
  return (hiredIds||[]).reduce((total,id)=>{
    const spec = STAFF_SPECIALISTS.find(s=>s.id===id);
    return total + (spec ? spec.cost : 0);
  }, 0);
}

const STYLES = [
  { id: "boxeur", name: "Boxeur", desc: "Mains rapides, KO en puissance, mais bagage au sol limité.", boxe:[45,58], grappling:[10,20], lutte:[10,20], cardio:[28,40], mental:[30,45], chin:[35,50] },
  { id: "lutteur", name: "Lutteur", desc: "Contrôle, ground-and-pound, moins à l'aise debout.", lutte:[45,58], boxe:[12,22], grappling:[14,24], cardio:[35,48], mental:[30,42], chin:[38,52] },
  { id: "grappler", name: "Grappleur (BJJ)", desc: "Soumissions et jeu de garde, discret en frappe.", grappling:[45,58], boxe:[12,22], lutte:[12,22], cardio:[30,42], mental:[35,48], chin:[25,38] },
  { id: "polyvalent", name: "MMA polyvalent", desc: "Bases solides partout, aucun point fort marqué.", boxe:[26,34], grappling:[26,34], lutte:[26,34], cardio:[32,42], mental:[32,42], chin:[32,42] },
];

// ---- Style de l'adversaire : influence réellement ses décisions tactiques et sa méthode de victoire ----
// Triangle classique du MMA : le lutteur cherche l'amenée au sol contre un boxeur, le grappler
// soumet un lutteur qui l'amène au sol, le boxeur garde le combat debout contre un grappler.
function pickOpponentStyle(org){
  // Plus l'organisation est huppée, plus les adversaires ont un style marqué (moins de "polyvalent").
  const r = Math.random();
  if (org.tier <= 1) return r<0.30 ? "polyvalent" : STYLES[randInt(0,2)].id;
  if (r < 0.18) return "polyvalent";
  return STYLES[randInt(0,2)].id;
}
function styleLabel(id){ const st = STYLES.find(s=>s.id===id); return st ? st.name : "Polyvalent"; }
// avantage tactique : +1 si le style de l'adversaire est en position de force face à la tactique du joueur,
// -1 si le joueur a l'avantage naturel, 0 en cas d'égalité de style.
function styleMatchupEdge(oppStyleId, tacticFocus){
  const beats = { lutteur:"boxeur", grappler:"lutteur", boxeur:"grappler" }; // clé bat valeur
  const focusToStyle = { boxe:"boxeur", lutte:"lutteur", grappling:"grappler" };
  const playerStyle = focusToStyle[tacticFocus];
  if (!playerStyle || oppStyleId==="polyvalent") return 0;
  if (beats[oppStyleId] === playerStyle) return 1; // l'adversaire a l'avantage de style
  if (beats[playerStyle] === oppStyleId) return -1; // le joueur a l'avantage de style
  return 0;
}
function opponentGameplanLine(oppStyleId, tacticFocus, traits){
  let base;
  if (oppStyleId==="lutteur") base = "Fidèle à son style, il cherche l'amenée au sol dans la grande majorité de ses échanges.";
  else if (oppStyleId==="grappler") base = "Il attend patiemment le sol pour dérouler son jeu de soumission.";
  else if (oppStyleId==="boxeur") base = "Il impose son rythme debout, mains hautes et distance travaillée, et ne cherche presque jamais l'amenée au sol.";
  else base = "Il reste polyvalent, prêt à s'adapter à ton plan de jeu.";
  return base + traitLabelsLine(traits);
}

// ---- Personnalité de l'adversaire : chaque combattant adverse a un profil comportemental qui
// influence réellement le déroulé du combat (fins anticipées, résistance en fin de combat,
// vulnérabilité de tes actions) et pas seulement un skill brut. Un champion/légende a un profil
// globalement plus complet et prudent qu'un adversaire de petit tier, plus brut et inégal. ----
const OPPONENT_TRAITS = [
  { id:"peureux", label:"une tendance à se montrer prudent voire hésitant sous la pression", weight:8 },
  { id:"agressif", label:"un tempérament agressif qui fonce dès la cloche", weight:10 },
  { id:"patient", label:"un vrai sens du timing, il n'attaque jamais dans la précipitation", weight:10 },
  { id:"opportuniste", label:"un instinct opportuniste qui punit la moindre erreur", weight:9 },
  { id:"finisseur", label:"un instinct de finisseur dès qu'il sent le combat basculer", weight:8 },
  { id:"grosCardio", label:"un cardio de fer qui ne faiblit jamais", weight:9 },
  { id:"faibleCardio", label:"un cardio friable qui craque en fin de combat", weight:8 },
  { id:"bonDefenseur", label:"une défense très solide, difficile à percer", weight:9 },
  { id:"mauvaisDefenseur", label:"des lacunes défensives exploitables", weight:8 },
];
function pickOpponentTraits(org, isTitle, legendary){
  const elite = isTitle || legendary;
  const n = elite ? 2 : (Math.random()<0.55 ? 2 : 1);
  const weighted = OPPONENT_TRAITS.map(t=>{
    let w = t.weight;
    if (elite){
      if (["patient","bonDefenseur","grosCardio","opportuniste","finisseur"].includes(t.id)) w *= 1.7;
      if (["peureux","mauvaisDefenseur","faibleCardio"].includes(t.id)) w *= 0.35;
    } else if ((org.tier||1) <= 1){
      if (["agressif","peureux","mauvaisDefenseur"].includes(t.id)) w *= 1.6;
      if (["patient","bonDefenseur","grosCardio"].includes(t.id)) w *= 0.6;
    }
    return w;
  });
  const picked = [];
  for (let k=0;k<n;k++){
    const idxs = OPPONENT_TRAITS.map((t,i)=>i).filter(i=>!picked.includes(OPPONENT_TRAITS[i].id));
    if (!idxs.length) break;
    const total = idxs.reduce((a,i)=>a+weighted[i],0);
    let r = Math.random()*total;
    for (const i of idxs){ r -= weighted[i]; if (r<=0){ picked.push(OPPONENT_TRAITS[i].id); break; } }
  }
  return picked;
}
function traitLabelsLine(traitIds){
  if (!traitIds || !traitIds.length) return "";
  const labels = traitIds.map(id=>OPPONENT_TRAITS.find(t=>t.id===id)?.label).filter(Boolean);
  if (!labels.length) return "";
  return ` On lui connaît ${labels.join(" et ")}.`;
}
// ---- Traits => delta de winChance côté joueur (positif = adversaire renforcé, donc soustrait) ----
function traitsWinChanceMalus(traitIds){
  const w = { agressif:2, peureux:-3, bonDefenseur:3, mauvaisDefenseur:-3, grosCardio:2, faibleCardio:-2, opportuniste:2, finisseur:2, patient:1 };
  return (traitIds||[]).reduce((a,id)=>a+(w[id]||0), 0);
}
// ---- Sous les 25% d'énergie, la puissance, la vitesse et la précision chutent fortement : ----
// c'est la traduction directe de "à moins de 25% de cardio [fatigue], tout diminue fortement".
function fatiguePenalty(s){
  const energie = s.energie||0;
  if (energie >= 25) return 0;
  const base = clamp((25-energie)*1.15, 0, 32);
  // ---- Perk passif "Cardio d'acier" : atténue nettement la pénalité de fatigue sévère ----
  return (s.passivePerks||[]).includes("cardio_acier") ? base*0.55 : base;
}
// ---- Fatigue MENTALE : distincte de l'énergie physique. S'accumule avec les combats, les semaines
// de camp enchaînées sans pause et les obligations médiatiques ; se résorbe avec le temps en famille
// et le repos. Passé un certain seuil, elle ronge les chances de victoire, comme un esprit trop las
// pour rester lucide dans l'octogone. ----
function mentalFatiguePenalty(s){
  const mf = s.mentalFatigue||0;
  if (mf <= 55) return 0;
  return clamp((mf-55)*0.6, 0, 26);
}

// ---- Catégories de poids : choisies au début, on peut ensuite monter ou descendre en cours de carrière ----
// order sert à calculer les catégories adjacentes (montée/descente). changeRisk = risque d'un happening
// négatif (mauvaise coupe de poids, perte de force, etc.) lors du changement.
const WEIGHT_CLASSES = [
  { id:"paille",   name:"Poids Paille",     limitKg:52,  order:1, opponentSkillAdj:-6 },
  { id:"mouche",   name:"Poids Mouche",     limitKg:57,  order:2, opponentSkillAdj:-4 },
  { id:"coq",      name:"Poids Coq",        limitKg:61,  order:3, opponentSkillAdj:-2 },
  { id:"plume",    name:"Poids Plume",      limitKg:66,  order:4, opponentSkillAdj:0 },
  { id:"leger",    name:"Poids Léger",      limitKg:70,  order:5, opponentSkillAdj:0 },
  { id:"mimoyen",  name:"Poids Mi-Moyen",   limitKg:77,  order:6, opponentSkillAdj:1 },
  { id:"moyen",    name:"Poids Moyen",      limitKg:84,  order:7, opponentSkillAdj:2 },
  { id:"milourd",  name:"Poids Mi-Lourd",   limitKg:93,  order:8, opponentSkillAdj:3 },
  { id:"lourd",    name:"Poids Lourd",      limitKg:120, order:9, opponentSkillAdj:5 },
];
function weightClassById(id){ return WEIGHT_CLASSES.find(w=>w.id===id) || WEIGHT_CLASSES[4]; }
function adjacentWeightClasses(id){
  const wc = weightClassById(id);
  return {
    up: WEIGHT_CLASSES.find(w=>w.order===wc.order+1) || null,
    down: WEIGHT_CLASSES.find(w=>w.order===wc.order-1) || null,
  };
}

// ---- Blessures localisées : au lieu d'une simple "blessure" générique, certaines convalescences
// touchent une zone précise du corps et pénalisent une discipline ou un aspect précis tant qu'elles
// ne sont pas guéries (indépendamment du compteur injuredTurns qui bloque les combats). ----
const LOCALIZED_INJURIES = [
  { id:"main_cassee", label:"Main cassée", icon:"🤕", zone:"boxe", desc:"La puissance de frappe en pâtit lourdement.", weeks:[5,9] },
  { id:"genou", label:"Genou fragilisé", icon:"🦵", zone:"lutte", desc:"Les amenées au sol et le contrôle en souffrent.", weeks:[6,10] },
  { id:"cote_fissuree", label:"Côte fissurée", icon:"🩻", zone:"cardio", desc:"Respirer à pleins poumons devient douloureux.", weeks:[4,7] },
  { id:"arcade_ouverte", label:"Arcade ouverte", icon:"🩸", zone:"coupure", desc:"Le risque d'arrêt médical par le docteur du combat grimpe fortement.", weeks:[2,3] },
  { id:"epaule", label:"Épaule instable", icon:"💢", zone:"grappling", desc:"Le jeu de soumission et de garde est limité.", weeks:[5,8] },
  { id:"cheville", label:"Cheville tordue", icon:"🦶", zone:"mobilite", desc:"Les déplacements et l'esquive sont ralentis.", weeks:[3,6] },
];
function localizedInjuryById(id){ return LOCALIZED_INJURIES.find(l=>l.id===id); }
// Cumul des malus actifs : chaque zone touchée pèse sur la winChance selon la tactique choisie.
function localizedInjuryWinChanceDelta(s, tactic){
  const list = s.localizedInjuries||[];
  if (!list.length) return 0;
  let delta = 0;
  list.forEach(li=>{
    if (li.zone==="boxe") delta -= (tactic && tactic.focus==="boxe") ? 11 : 3;
    else if (li.zone==="lutte") delta -= (tactic && tactic.focus==="lutte") ? 13 : 3;
    else if (li.zone==="grappling") delta -= (tactic && tactic.focus==="grappling") ? 12 : 3;
    else if (li.zone==="cardio") delta -= 8;
    else if (li.zone==="mobilite") delta -= 5;
    else if (li.zone==="coupure") delta -= 2;
  });
  return delta;
}
function hasLocalizedInjury(s, id){ return (s.localizedInjuries||[]).some(li=>li.id===id); }
// Une arcade ouverte augmente nettement la probabilité d'un arrêt médical (traduit en risque de TKO accru).
function localizedCutTkoMult(s){ return hasLocalizedInjury(s,"arcade_ouverte") ? 1.45 : 1; }
function tickLocalizedInjuries(ns, weeks){
  if (!ns.localizedInjuries || !ns.localizedInjuries.length) return ns;
  ns.localizedInjuries = ns.localizedInjuries
    .map(li => ({ ...li, weeksLeft: (li.weeksLeft||0) - weeks }))
    .filter(li => li.weeksLeft > 0);
  return ns;
}
function rollLocalizedInjury(){
  const base = LOCALIZED_INJURIES[randInt(0, LOCALIZED_INJURIES.length-1)];
  return { id: base.id, label: base.label, icon: base.icon, zone: base.zone, weeksLeft: randInt(...base.weeks) };
}

// ---- Arbitres : chaque combat est officié par un arbitre au profil défini qui influence
// directement quand un combat s'arrête (stoppages précoces ou tardifs), les avertissements et
// le risque d'un retrait de points ou d'une disqualification. ----
const REFEREES = [
  { id:"herb", name:"Arbitre H. Deane", style:"laisse_combattre", stopBias:-0.35, warnBias:0.6, dqBias:0.6, desc:"Laisse les combattants s'exprimer, intervient tard." },
  { id:"marc", name:"Arbitre M. Godard", style:"strict", stopBias:0.45, warnBias:1.3, dqBias:1.1, desc:"Très à cheval sur la sécurité, dégaine vite le stoppage." },
  { id:"julie", name:"Arbitre J. Renard", style:"equilibre", stopBias:0, warnBias:1.0, dqBias:1.0, desc:"Arbitrage classique, ni trop tôt ni trop tard." },
  { id:"kenji", name:"Arbitre K. Osano", style:"laisse_combattre", stopBias:-0.25, warnBias:0.8, dqBias:0.8, desc:"École japonaise : grande latitude laissée aux combattants." },
  { id:"sara", name:"Arbitre S. Diakité", style:"strict", stopBias:0.5, warnBias:1.4, dqBias:1.3, desc:"N'hésite jamais à intervenir au moindre doute." },
];
function pickReferee(){ return REFEREES[randInt(0, REFEREES.length-1)]; }
function refereeStyleLabel(ref){ return ref.style==="strict" ? "arbitre strict" : ref.style==="laisse_combattre" ? "arbitre qui laisse combattre" : "arbitre équilibré"; }

// ---- Juges : trois juges indépendants notent chaque round, avec une marge d'appréciation propre
// à chacun — d'où les vraies décisions partagées ou majoritaires, calculées à partir du combat
// réellement vécu plutôt que tirées au hasard sans lien avec ce qui s'est passé. ----
const JUDGE_NAMES = ["Juge A. Fontaine","Juge M. Delacroix","Juge P. Nakamura","Juge L. Herrera","Juge C. Okafor","Juge R. Svensson","Juge T. Marchetti","Juge Y. Kowalski"];
function pickJudgesPanel(){
  const pool = [...JUDGE_NAMES].sort(()=>Math.random()-0.5);
  return [0,1,2].map(i=>({ name: pool[i], wobble: rand(0.7,1.35) }));
}
// Note un round pour un juge donné à partir de l'écart réel de ce round (delta>0 = round du joueur).
function scoreRoundForJudge(delta, judge){
  const noisy = delta + rand(-3.5,3.5)*judge.wobble;
  if (Math.abs(noisy) < 1.2 && Math.random() < 0.12) return [10,10]; // round égalité, rare
  if (noisy >= 8) return [10,8];
  if (noisy <= -8) return [8,10];
  return noisy >= 0 ? [10,9] : [9,10];
}

// ---- Blessures survenant EN PLEIN COMBAT (distinctes des blessures localisées de longue durée
// entre deux combats) : elles pèsent immédiatement sur les décisions du combattant pour le reste
// du combat, et les plus sévères peuvent forcer un arrêt médical avant la limite des rounds. ----
const FIGHT_INJURIES = [
  { id:"fi_nez", label:"Nez cassé", icon:"👃", desc:"La respiration est perturbée, le cardio en pâtit.", successAdj:-4, docStopRisk:0.05, mapsToLocalized:null },
  { id:"fi_oeil", label:"Œil qui commence à fermer", icon:"👁️", desc:"La perception des distances devient difficile.", successAdj:-9, docStopRisk:0.17, mapsToLocalized:null },
  { id:"fi_cheville", label:"Cheville tordue", icon:"🦶", desc:"Les appuis et les déplacements sont limités.", successAdj:-7, docStopRisk:0.04, zoneAdj:"lutte", mapsToLocalized:"cheville" },
  { id:"fi_main", label:"Main cassée", icon:"🤕", desc:"La puissance de frappe s'effondre.", successAdj:-10, docStopRisk:0.03, zoneAdj:"boxe", mapsToLocalized:"main_cassee" },
  { id:"fi_vision", label:"Perte de vision passagère", icon:"💫", desc:"Un coup à la tête laisse des étoiles, tout devient flou quelques instants.", successAdj:-14, docStopRisk:0.11, mapsToLocalized:null },
  { id:"fi_coupure", label:"Coupure importante", icon:"🩸", desc:"Le sang coule et gêne la vision — l'arbitre et le docteur surveillent de très près.", successAdj:-5, docStopRisk:0.24, mapsToLocalized:"arcade_ouverte" },
];
function rollFightInjury(){ return FIGHT_INJURIES[randInt(0, FIGHT_INJURIES.length-1)]; }
function hasActiveCutOrEyeInjury(fightInjuries){ return (fightInjuries||[]).some(fi=>fi.id==="fi_coupure" || fi.id==="fi_oeil"); }
function fightInjuriesSuccessAdj(fightInjuries, tacticFocus){
  if (!fightInjuries || !fightInjuries.length) return 0;
  return fightInjuries.reduce((a,fi)=>{
    const sevMult = 1 + 0.3*(fi.severity||0);
    let adj = fi.successAdj * sevMult;
    if (fi.zoneAdj && tacticFocus===fi.zoneAdj) adj *= 1.4;
    return a + adj;
  }, 0);
}
function fightInjuriesDocStopChance(fightInjuries){
  if (!fightInjuries || !fightInjuries.length) return 0;
  return fightInjuries.reduce((a,fi)=>a + Math.min(0.55, fi.docStopRisk + 0.08*(fi.severity||0)), 0);
}
// ---- Coupure/œil qui s'aggrave round après round : une blessure visible au visage ne reste pas
// figée, elle empire tant qu'elle continue d'être touchée, jusqu'à un arrêt médical de plus en plus
// probable. Distinct des autres blessures (nez, cheville, main) qui ne s'aggravent pas dans le temps. ----
function worsenVisibleInjuries(fightInjuries){
  if (!fightInjuries || !fightInjuries.length) return { injuries: fightInjuries, line: null };
  let line = null;
  const injuries = fightInjuries.map(fi=>{
    if ((fi.id==="fi_coupure" || fi.id==="fi_oeil") && (fi.severity||0) < 3 && Math.random() < 0.4){
      line = fi.id==="fi_coupure"
        ? "🩸 La coupure s'aggrave nettement : le sang coule de plus en plus, l'arbitre s'inquiète."
        : "👁️ L'œil continue de se refermer, la gêne visuelle s'accentue round après round.";
      return { ...fi, severity: (fi.severity||0)+1 };
    }
    return fi;
  });
  return { injuries, line };
}

// ---- Coupures infligées à L'ADVERSAIRE pendant le combat : miroir de FIGHT_INJURIES, utilisées
// par l'ordre de coin "cible spécifique" (viser une coupure déjà ouverte pour provoquer un arrêt médical). ----
const OPPONENT_CUTS = [
  { id:"oc_arcade", label:"Arcade ouverte", icon:"🩸", desc:"Une coupure s'ouvre au-dessus de l'œil adverse, le sang commence à couler.", docStopRisk:0.14 },
  { id:"oc_nez", label:"Nez en sang", icon:"👃", desc:"Le nez de l'adversaire saigne abondamment.", docStopRisk:0.07 },
  { id:"oc_oeil", label:"Œil qui enfle", icon:"👁️", desc:"L'œil adverse commence à se fermer sous les coups.", docStopRisk:0.10 },
];
function rollOpponentCut(){ return OPPONENT_CUTS[randInt(0, OPPONENT_CUTS.length-1)]; }
function oppCutsDocStopChance(oppCuts){
  if (!oppCuts || !oppCuts.length) return 0;
  return oppCuts.reduce((a,c)=>a+c.docStopRisk, 0);
}

// ---- Ordres de coin donnés entre les rounds : chaque round terminé (sauf le dernier), le coach
// propose un choix qui influence directement le round suivant. ----
const CORNER_ORDERS = [
  { id:"allin", label:"🔥 Prise de risque maximum", desc:"Tu pousses à fond pour chercher la finition. Chances de KO/soumission en hausse, mais tu vas puiser dans tes réserves." },
  { id:"manage", label:"🛡️ Gestion de la décision", desc:"Tu resserres ta défense et contrôles le rythme. Moins de risque de dégâts, mais un combat moins spectaculaire aux yeux du public." },
];
const CORNER_ORDER_TARGET_CUT = { id:"target_cut", label:"🎯 Cible spécifique : viser la coupure", desc:"Ton coach te demande de retravailler la coupure déjà ouverte de l'adversaire pour forcer l'arrêt du médecin." };
const CORNER_ORDER_RESET_POSITION = { id:"reset_position", label:"🔄 Repositionnement : se dégager de la cage", desc:"Tu es acculé contre le grillage — ton coach te demande de te dégager pour retrouver le centre de la cage, au prix d'un effort supplémentaire." };

// ---- Cage Positioning : où se déroule l'échange dans l'octogone. Un score continu (-2.2 à +2.2)
// dérive round après round selon les actions et leur issue, puis se traduit en 3 zones :
// centre (neutre), avantage joueur (adversaire acculé au grillage) ou avantage adversaire (joueur
// acculé au grillage). Chaque zone influence directement le round en cours ET peut être forcée à se
// réinitialiser via un ordre de coin dédié. ----
function cagePositionBucket(score){
  const sc = score||0;
  if (sc >= 0.8) return "avantage_joueur";
  if (sc <= -0.8) return "avantage_adversaire";
  return "centre";
}
function cagePositionLabel(bucket){
  if (bucket==="avantage_joueur") return "🥊 Tu as acculé l'adversaire contre le grillage";
  if (bucket==="avantage_adversaire") return "⚠️ Tu es acculé contre le grillage";
  return "🎯 Combat au centre de la cage";
}
// Bonus/malus appliqué CE round selon la zone où se trouve l'échange (avant résolution de l'action).
function cagePositionRoundDelta(bucket){
  if (bucket==="avantage_joueur") return 2.5;
  if (bucket==="avantage_adversaire") return -2.5;
  return 0;
}
function cagePositionInjuryAdj(bucket){
  // Acculé contre la cage, on encaisse un peu plus ; à l'inverse on inflige un peu plus de dégâts.
  return { selfAdj: bucket==="avantage_adversaire" ? 0.03 : 0, oppAdj: bucket==="avantage_joueur" ? 0.03 : 0 };
}


// ---- Objectifs imposés par l'organisation pour CE combat précis (distincts des objectifs
// personnels de saison) : accepter le contrat, c'est aussi accepter une mission de com'. ----
const ORG_OBJECTIVES = [
  { id:"finish", label:"L'organisation veut du spectacle : termine le combat avant la limite des rounds.",
    check:(win,method)=> win && method.code!=="decision", rewardRep:5, rewardPurseMult:1.15,
    failNote:"Contrat de performance manqué : tu as gagné, mais pas de la manière demandée." },
  { id:"quick", label:"Contrat de performance : termine le combat dès le premier round pour toucher la prime.",
    check:(win,method)=> win && method.round===1 && method.code!=="decision", rewardRep:8, rewardPurseMult:1.35,
    failNote:"Prime de performance manquée : le combat a duré plus d'un round." },
  { id:"survive", label:"Combat référence pour la fédération : va au bout des rounds prévus, quoi qu'il arrive.",
    check:(win,method,opt)=> method.round >= opt.maxRoundPlanned, rewardRep:4, rewardPurseMult:1.1,
    failNote:"Objectif d'organisation manqué : le combat s'est arrêté avant la limite." },
];
function maybeAssignOrgObjective(opt){
  if (!opt.dwcs && Math.random() < 0.3){
    opt.orgObjective = ORG_OBJECTIVES[randInt(0, ORG_OBJECTIVES.length-1)];
  }
  return opt;
}
// ---- Combat de dernière minute : l'adversaire prévu se blesse quelques jours avant l'événement.
// Un remplaçant est proposé — l'accepter permet de "sauver la carte" (bourse et réputation en
// hausse) mais avec moins de préparation (chance de victoire réduite). Ne pas le sélectionner dans
// la liste des offres revient à attendre une meilleure opportunité. ----
function maybeMakeLastMinute(opt){
  if (!opt.dwcs && !opt.underContract && Math.random() < 0.16){
    opt.lastMinute = true;
    opt.winChance = clamp(opt.winChance - 7, 5, 95);
    opt.purseLow = Math.round(opt.purseLow*1.2);
    opt.purseHigh = Math.round(opt.purseHigh*1.3);
    opt.orgObjective = { id:"save_card", label:"Remplacement accepté à quelques jours de l'événement : tu sauves la carte.",
      check:()=>true, rewardRep:4, rewardPurseMult:1, failNote:"" };
  }
  return opt;
}

// ---- Popularité par pays/région : chaque victoire (surtout spectaculaire, surtout pour un titre)
// fait grandir ta cote locale ; chaque défaite l'érode un peu. Tu peux devenir une star dans un
// pays et rester un inconnu ailleurs — et le public de la salle te le rend bien (voir crowdEffect). ----
function countryPopularityDelta(win, method, isTitle){
  if (win){
    let base = 4 + (isTitle?6:0);
    if (method && method.code!=="decision") base += 3;
    return base;
  }
  return -3;
}
function popularityLabel(pop){
  if (pop >= 80) return "Star absolue";
  if (pop >= 60) return "Très populaire";
  if (pop >= 35) return "Connu(e)";
  if (pop >= 15) return "Peu connu(e)";
  return "Inconnu(e) / mal-aimé(e)";
}
// ---- Le public de la salle t'influence directement : confiance, hype, moral, et même les
// chances de victoire (avantage/désavantage du terrain), selon ta cote de popularité locale. ----
function crowdEffect(pop){
  const p = pop==null ? 25 : pop;
  if (p >= 65) return { moralAdj: 3, winAdj: 3, label: "🏟️ Le public est totalement acquis à ta cause — la salle scande ton nom, ça te porte." };
  if (p <= 12) return { moralAdj: -4, winAdj: -3, label: "🏟️ Le public est clairement hostile — tu sens toute la salle contre toi, difficile de rester serein(e)." };
  return { moralAdj: 0, winAdj: 0, label: null };
}

// ---- Réaction du public EN DIRECT pendant le combat : huées ou ovations selon l'action choisie et
// son issue. Contrairement à crowdEffect (ambiance générale de la salle avant le combat, liée à ta
// popularité locale), ceci réagit round après round à ce qui se passe sur le moment. Un jeu trop
// prudent répété use la patience du public et fait chuter le hype ; le spectacle est récompensé. ----
function crowdReactionLine(action, success, consecutiveSafe){
  if (action.kind === "risky"){
    return success
      ? { line:"🙌 La foule explose, ovation debout pour cette action spectaculaire !", moral:2, hype:3 }
      : { line:"😬 Un murmure déçu parcourt la salle après cette tentative ratée.", moral:-1, hype:0 };
  }
  if (action.kind === "technique" && success){
    return { line:"👏 Belle ovation pour cette technique bien exécutée.", moral:1, hype:2 };
  }
  if (action.kind === "safe"){
    const n = consecutiveSafe||0;
    if (n >= 2) return { line:"😒 Les huées pleuvent : le public trouve ce combat bien trop prudent à son goût.", moral:-2, hype:-3 };
    return { line:"😐 Quelques sifflets isolés — le public attend plus de spectacle.", moral:0, hype:-1 };
  }
  return null;
}

// ---- Adaptation tactique de l'adversaire EN PLEIN COMBAT : il ne suit plus un scénario figé du
// début à la fin, il réagit round après round à ce que tu lui infliges (et à ton état de forme). ----
function computeOppAdaptation(opt, s){
  const hist = opt.roundHistory || [];
  const adapt = { ...(opt.oppAdapt||{}) };
  const newLines = [];
  if (hist.length >= 2){
    const last2 = hist.slice(-2);
    if (last2.every(h=>h.focus==="boxe" && h.delta>0) && !adapt.switchedGround && (opt.oppStyleId==="lutteur"||opt.oppStyleId==="grappler")){
      adapt.switchedGround = true;
      newLines.push(`🧠 Adaptation adverse : il ne peut rien faire debout face à toi — il bascule sa stratégie vers le sol pour te sortir de ta zone de confort.`);
    }
    const boxeWinsCount = hist.filter(h=>h.focus==="boxe" && h.delta>0).length;
    if (boxeWinsCount >= 2 && !adapt.prudent){
      adapt.prudent = true;
      newLines.push(`🧠 Adaptation adverse : il encaisse trop en boxe à son goût — il devient beaucoup plus prudent, garde la distance et prend moins de risques.`);
    }
  }
  if (fatiguePenalty(s) > 10 && !adapt.pressing){
    adapt.pressing = true;
    newLines.push(`🧠 Adaptation adverse : il sent que tu es cramé(e) — il monte immédiatement la pression pour chercher la fin du combat.`);
  }
  return { adapt, newLines };
}
function oppAdaptWinDelta(adapt){
  if (!adapt) return 0;
  return (adapt.pressing ? -6 : 0) + (adapt.switchedGround ? 4 : 0);
}
function oppAdaptFinishChanceDelta(adapt){
  if (!adapt) return 0;
  return (adapt.pressing ? 0.12 : 0);
}
function oppAdaptActionAdj(adapt){
  if (!adapt) return 0;
  return (adapt.prudent ? -5 : 0) + (adapt.switchedGround ? -4 : 0);
}

// ---- Interventions d'arbitrage en cours de combat : arrêt médical (blessure), arrêt du coin
// (correction trop one-sided), et très rarement un accroc accidentel ou une disqualification.
// Renvoie null si le combat continue normalement. ----
function checkRefereeIntervention(opt, s){
  const ref = opt.referee || REFEREES[2];
  const cumulative = (opt.roundHistory||[]).reduce((a,h)=>a+h.delta,0);
  // Coupure adverse ciblée par le coin : si l'ordre "cible spécifique" vient d'être donné, la
  // coupure déjà ouverte de l'adversaire a bien plus de chances de forcer l'arrêt du médecin.
  const cutBoost = opt.cornerOrder === "target_cut" ? 2.2 : 1;
  const oppDocChance = oppCutsDocStopChance(opt.oppCuts) * cutBoost * (1 + Math.max(0, ref.stopBias));
  if (oppDocChance > 0 && Math.random() < oppDocChance){
    return { win:true, method: { code:"arret_medecin", round: opt.roundIndex, decisionType:null, maxRound: opt.maxRoundPlanned }, refereeLine: `🩺 La coupure de l'adversaire est trop sévère : le médecin invite l'arbitre à stopper le combat en ta faveur !` };
  }
  const docChance = fightInjuriesDocStopChance(opt.fightInjuries) * (1 + Math.max(0, ref.stopBias)) * (opt.cutmanRiskMult||1);
  if (docChance > 0 && Math.random() < docChance){
    const playerAhead = cumulative > 4;
    return { win: playerAhead, method: { code:"arret_medecin", round: opt.roundIndex, decisionType:null, maxRound: opt.maxRoundPlanned }, refereeLine: `🩺 Le médecin du combat intervient et invite l'arbitre à stopper la rencontre.` };
  }
  if (opt.roundIndex >= 2){
    if (cumulative <= -22 && Math.random() < (0.06 + Math.max(0,ref.stopBias)*0.06)){
      return { win:false, method: { code:"arret_coin", round: opt.roundIndex, decisionType:null, maxRound: opt.maxRoundPlanned }, refereeLine: `🚩 Ton coin jette l'éponge : la correction est trop one-sided pour continuer.` };
    }
    if (cumulative >= 22 && Math.random() < (0.045 + Math.max(0,ref.stopBias)*0.045)){
      return { win:true, method: { code:"arret_coin", round: opt.roundIndex, decisionType:null, maxRound: opt.maxRoundPlanned }, refereeLine: `🚩 Le coin adverse jette l'éponge — la domination est sans appel.` };
    }
  }
  if (Math.random() < 0.004 * (ref.dqBias||1)){
    return { win:false, method: { code:"dq", round: opt.roundIndex, decisionType:null, maxRound: opt.maxRoundPlanned }, refereeLine: `🟥 ${ref.name} siffle une faute grave et prononce la disqualification — un scénario aussi rare que cruel.` };
  }
  if (Math.random() < 0.003){
    return { win:null, method: { code:"no_contest", round: opt.roundIndex, decisionType:null, maxRound: opt.maxRoundPlanned }, refereeLine: `⬜ Un accroc accidentel (coup de tête, coup bas non volontaire) empêche le combat d'aller à son terme dans des conditions normales.` };
  }
  return null;
}

// ---- Coupe de poids : mini-jeu interactif sur les 3 jours précédant la pesée ----
// J-3 et J-2 : on choisit chaque jour une méthode (sauna, diète hydrique ou approche prudente).
// Chaque choix a un effet physique immédiat + fait progresser un cumul d'eau perdue et un risque de complication.
const WEIGHT_CUT_ACTIONS = [
  { id:"sauna", label:"🔥 Bain chaud / Sauna", desc:"Perte d'eau rapide et importante, mais fatigue le corps : ça tape sur le menton et le cardio.",
    water:[3,5], d:{ chin:-2, cardio:-1, energie:-2 }, riskAdd:0.15 },
  { id:"diete", label:"🥤 Diète hydrique stricte", desc:"Coupe les apports en eau et en sel. Efficace, mais risque réel de vertiges, voire d'échec pur et simple de la pesée.",
    water:[2,4], d:{ energie:-2, moral:-2 }, riskAdd:0.22, dieteRisk:true },
  { id:"prudent", label:"🧘 Approche prudente", desc:"Tu restes proche de ton hydratation normale : peu de perte de poids en plus, mais zéro risque.",
    water:[0,1], d:{}, riskAdd:0 },
];

// Résout le choix d'un jour de coupe : renvoie le delta à appliquer immédiatement + les cumuls mis à jour.
function resolveCutDayAction(actionId, cumWater, cumRisk){
  const a = WEIGHT_CUT_ACTIONS.find(x=>x.id===actionId);
  const water = rand(a.water[0], a.water[1]);
  return {
    d: a.d,
    water,
    risk: a.riskAdd,
    newWater: cumWater + water,
    newRisk: cumRisk + a.riskAdd,
    dieteRisk: !!a.dieteRisk,
    result: `${a.label} : ${a.desc}`,
  };
}

// Résout la pesée elle-même une fois les 2 jours de coupe passés.
function resolveWeighIn(cumWater, cumRisk, hadDiete){
  const roll = Math.random();
  const failChance = hadDiete ? clamp(cumRisk*0.32 - 0.02, 0, 0.18) : clamp(cumRisk*0.18, 0, 0.08);
  if (roll < failChance){
    return { outcome:"fail", d:{ money:-1500, moral:-10, reputation:-3 },
      result:"❌ Échec de la pesée ! Tu ne rentres pas dans la catégorie à temps : le combat est annulé (ou requalifié en catch-weight) et ta réputation en prend un coup." };
  }
  if (roll < failChance + cumRisk*0.5){
    return { outcome:"vertige", d:{ energie:-8, health:-4, moral:-5 }, cutBonus:-10,
      result:"🚨 Vertiges et malaise sur la balance : la coupe est passée trop près, ton corps encaisse mal en vue du combat." };
  }
  const bonus = clamp(Math.round(cumWater*1.3), 0, 10);
  if (bonus >= 4){
    return { outcome:"ok", d:{}, cutBonus: bonus,
      result:`⚖️ Pesée réussie avec une belle marge : tu rentres dans l'octogone avec un net avantage physique sur ton adversaire.` };
  }
  return { outcome:"ok", d:{}, cutBonus: bonus,
    result:"⚖️ Pesée passée sans accroc, approche tranquille, aucun avantage de gabarit particulier." };
}

// Résout la réhydratation post-pesée (24h) : selon l'option choisie et la présence d'un nutritionniste dans le staff,
// on récupère une partie (ou la totalité) des à-coups physiques encaissés pendant la coupe.
function resolveRehydration(optionId, cutPenalty, hasNutri){
  const restoreFactor = optionId==="intensive" ? (hasNutri? 1.0 : 0.7) : (hasNutri? 0.55 : 0.35);
  const d = {};
  Object.keys(cutPenalty||{}).forEach(k=>{
    const v = cutPenalty[k]||0;
    if (v < 0) d[k] = Math.round(-v*restoreFactor);
  });
  if (optionId==="intensive") d.money = (d.money||0) - 400;
  const label = optionId==="intensive"
    ? (hasNutri
        ? "💧 Réhydratation intensive supervisée par ton nutritionniste : tu récupères l'essentiel de ta forme physique avant d'entrer en cage."
        : "💧 Réhydratation intensive : coûteuse mais efficace, tu récupères une bonne partie de ta forme.")
    : (hasNutri
        ? "🥤 Réhydratation standard, mais ton nutritionniste optimise le protocole : récupération correcte."
        : "🥤 Réhydratation standard, sans accompagnement particulier : tu ne récupères qu'une partie de tes sensations.");
  return { d, result: label };
}

// ---- Rivalités : un adversaire affronté peut devenir un vrai rival avec le temps. Les combats
// contre un rival dégagent bien plus de hype, les trilogies sont possibles (3ème confrontation),
// et les deux combattants progressent plus vite dans les semaines qui précèdent une revanche. ----
function findRival(s, orgId, oppSkillRef){
  return (s.rivals||[]).find(r => r.orgId===orgId && r.meetings < 3);
}
function rivalTrilogyLabel(meetings){
  if (meetings===2) return "Trilogie décisive";
  if (meetings===1) return "Revanche tant attendue";
  return null;
}
// ---- Trilogy Payday : avant une revanche ou une trilogie, négociation d'une clause de contrat
// spéciale — plancher garanti (Money Fight) ou objectif de performance qui multiplie fortement
// la prime s'il est rempli (finish avant la limite, ou KO/TKO dès le round 1). ----
const RIVAL_CLAUSES = [
  { id:"standard", label:"Contrat classique", desc:"Bourse normale, sans condition particulière." },
  { id:"money", label:"💰 Money Fight", desc:"Plancher garanti nettement plus élevé (x1,4), quel que soit le résultat du combat." },
  { id:"finish", label:"🔥 Clause spectacle : finition avant la limite", desc:"Si tu l'emportes par KO, TKO ou soumission (n'importe quel round) : prime x1,7. Sinon (décision ou défaite) : prime réduite." },
  { id:"round1ko", label:"⚡ Clause légendaire : KO/TKO dès le round 1", desc:"Fidèle à la demande de ton rival : si tu le termines dès le premier round, la prime double quasiment (x2,2). Sinon, prime nettement réduite." },
];
// Après un combat "normal" (ni légende, ni DWCS), un adversaire peut devenir un rival, avec plus
// de chances si le combat était accroché (winChance proche de 50) ou si un échange verbal a eu lieu.
function maybeCreateOrUpdateRival(ns, opt, win){
  if (opt.legendary || opt.dwcs) return ns;
  const existing = (ns.rivals||[]).find(r => r.name===opt.opponent && r.orgId===opt.org.id);
  if (existing){
    const rivals = ns.rivals.map(r => r===existing ? {
      ...r, meetings: r.meetings+1, myWins: r.myWins + (win?1:0), myLosses: r.myLosses + (win?0:1),
      oppSkill: clamp(r.oppSkill + rand(1,4), 15, 99),
    } : r);
    ns.rivals = rivals;
    return ns;
  }
  const closeFight = Math.abs((opt.winChance||50) - 50) < 16;
  const chance = (closeFight ? 0.20 : 0.07) + (opt.trashName?0.06:0);
  if (Math.random() < chance){
    ns.rivals = [...(ns.rivals||[]), {
      name: opt.opponent, orgId: opt.org.id, orgName: opt.org.name, meetings: 1,
      myWins: win?1:0, myLosses: win?0:1, oppSkill: opt.oppSkill,
    }];
  }
  return ns;
}

// ---- Classement mondial dynamique : un top 15 vivant par organisation. Les autres combattants du
// classement se battent entre eux au fil des semaines ; une grosse performance d'un rival peut te
// faire perdre une place sans même que tu combattes. ----
function initOrgRanking(org, gender){
  return Array.from({length:15}, (_,i) => ({
    name: randName(gender), power: clamp(50 + org.tier*6 - i*2.2 + rand(-3,3), 10, 99),
  }));
}
function ensureOrgRanking(ns, orgId, org){
  ns.rankings = ns.rankings || {};
  if (!ns.rankings[orgId]) ns.rankings[orgId] = initOrgRanking(org, ns.gender);
  return ns;
}
// Simule des combats internes au classement (les combattants du top 15 se battent entre eux),
// et une chance minime qu'une "grosse performance" fasse bondir quelqu'un de plusieurs places —
// ce qui peut faire reculer le joueur d'une place sans qu'il ait combattu.
function simulateRankingTick(ns, org){
  const orgId = org.id;
  ns = ensureOrgRanking(ns, orgId, org);
  let list = [...ns.rankings[orgId]];
  // combats internes aléatoires entre membres du classement
  for (let k=0;k<2;k++){
    const i = randInt(0, list.length-1);
    let j = randInt(0, list.length-1);
    if (i===j) continue;
    const a = list[i], b = list[j];
    const pWin = 0.5 + (a.power - b.power)*0.01;
    if (Math.random() < pWin) list[i] = { ...a, power: clamp(a.power + rand(0.5,2), 10, 99) };
    else list[j] = { ...b, power: clamp(b.power + rand(0.5,2), 10, 99) };
  }
  // grosse performance rare (1.5%) : un combattant bondit nettement
  if (Math.random() < 0.015){
    const idx = randInt(0, list.length-1);
    list[idx] = { ...list[idx], power: clamp(list[idx].power + rand(10,20), 10, 99), breakout: true };
  }
  list.sort((a,b)=> b.power - a.power);
  ns.rankings[orgId] = list.map(f => { const { breakout, ...rest } = f; return rest; });
  // si le joueur est classé dans cette organisation, une percée d'un autre combattant peut le faire reculer
  const myRank = (ns.orgRanks||{})[orgId];
  const breakoutHappened = list.some(f=>f.breakout);
  if (myRank && breakoutHappened && myRank < 15 && Math.random()<0.5){
    ns.orgRanks = { ...(ns.orgRanks||{}), [orgId]: myRank + 1 };
  }
  return ns;
}
// Après une victoire dans une organisation, le joueur peut entrer/monter dans le classement.
function updatePlayerRankOnWin(ns, org, isTitle){
  const orgId = org.id;
  ns.orgRanks = ns.orgRanks || {};
  if (isTitle){ ns.orgRanks[orgId] = 0; return ns; } // 0 = champion, hors classement numéroté
  const current = ns.orgRanks[orgId];
  if (current === 0) return ns; // déjà champion
  if (current === undefined || current === null){
    if (Math.random() < 0.35) ns.orgRanks[orgId] = 15;
  } else {
    const jump = randInt(1,3);
    ns.orgRanks[orgId] = Math.max(1, current - jump);
  }
  return ns;
}
function rankLabelFor(ns, orgId){
  const r = (ns.orgRanks||{})[orgId];
  if (r === undefined || r === null) return null;
  if (r === 0) return "🏆 Champion en titre";
  return `#${r} au classement`;
}

// ---- Classement mondial (Top 50 pound-for-pound, toutes organisations confondues) : distinct des
// classements par organisation, il vit chaque semaine que le joueur combatte ou non. Les vétérans
// trop âgés prennent leur retraite et sont remplacés par de nouveaux prospects, pour que le Top 50
// ne stagne jamais sur les mêmes noms pendant toute une carrière. ----
function initGlobalRanking(gender){
  return Array.from({length:50}, (_,i) => ({
    name: randName(gender),
    power: clamp(94 - i*1.4 + rand(-2,2), 20, 99),
    age: randInt(22, 35),
  }));
}
function ensureGlobalRanking(ns){
  if (!ns.globalRanking) ns.globalRanking = initGlobalRanking(ns.gender);
  return ns;
}
function simulateGlobalRankingTick(ns){
  ns = ensureGlobalRanking(ns);
  let list = [...ns.globalRanking];
  // combats internes aléatoires entre membres du Top 50
  for (let k=0;k<3;k++){
    const i = randInt(0, list.length-1);
    let j = randInt(0, list.length-1);
    if (i===j) continue;
    const a = list[i], b = list[j];
    const pWin = 0.5 + (a.power - b.power)*0.01;
    if (Math.random() < pWin) list[i] = { ...a, power: clamp(a.power + rand(0.5,2), 10, 99) };
    else list[j] = { ...b, power: clamp(b.power + rand(0.5,2), 10, 99) };
  }
  // vieillissement lent, puis retraite des vétérans (dès 33 ans, chance croissante chaque semaine) :
  // le combattant retraité est immédiatement remplacé par un jeune prospect au potentiel encore flou.
  const lines = [];
  list = list.map(f => {
    const age = f.age + (Math.random()<0.02 ? 1 : 0);
    if (age >= 33 && Math.random() < 0.004*(age-32)){
      lines.push(`🎖️ ${f.name} annonce sa retraite du classement mondial — un nouveau prospect fait son entrée dans le Top 50.`);
      return { name: randName(ns.gender), power: clamp(rand(35,58), 20, 99), age: randInt(19,23) };
    }
    return { ...f, age };
  });
  // grosse performance rare (2%) : un combattant bondit nettement dans le classement
  let breakout = false;
  if (Math.random() < 0.02){
    const idx = randInt(0, list.length-1);
    list[idx] = { ...list[idx], power: clamp(list[idx].power + rand(10,22), 10, 99) };
    breakout = true;
  }
  list.sort((a,b)=> b.power - a.power);
  ns.globalRanking = list;
  // si le joueur est classé, une percée d'un autre combattant peut le faire reculer sans qu'il combatte
  if (breakout && ns.globalRank && ns.globalRank < 50 && Math.random()<0.4){
    ns.globalRank = ns.globalRank + 1;
    lines.push(`📉 Une performance marquante ailleurs te fait reculer au #${ns.globalRank} mondial (Top 50 toutes catégories confondues).`);
  }
  return { ns, lines };
}
// Après un combat, le joueur peut entrer/monter dans le classement mondial P4P (indépendant des
// classements par organisation). L'entrée est plus dure qu'à l'échelle d'une seule organisation :
// il faut une vraie réputation, et un titre ou une finition aide beaucoup.
// Le classement mondial P4P n'est ouvert qu'à un cercle très restreint : il faut avoir été
// champion PFL au moins une fois, OU avoir décroché au moins 2 titres dans des organisations
// autres que PFL/UFC (ces deux organisations ne comptent pas dans ce second critère).
function isP4PEligible(ns){
  const won = ns.titlesWonOrgs || [];
  if (won.includes("PFL")) return true;
  const outsideBigTwo = won.filter(n => n !== "PFL" && n !== "UFC").length;
  return outsideBigTwo >= 2;
}
function updatePlayerGlobalRankOnWin(ns, isTitleWin, finish, legendary){
  if (!isP4PEligible(ns)) return ns; // pas encore assez légitime pour figurer au P4P
  const strength = (ns.reputation||0)*0.5 + (ns.hype||0)*0.3 + overallSkill(ns)*0.4;
  if (ns.globalRank === undefined || ns.globalRank === null){
    const entryChance = clamp((strength - 42) * 0.02, 0, 0.55) + (isTitleWin?0.25:0) + (finish?0.06:0);
    if (Math.random() < entryChance) ns.globalRank = randInt(38, 50);
    return ns;
  }
  let jump = randInt(1,2);
  if (isTitleWin) jump += 3;
  if (finish) jump += 1;
  if (legendary) jump += 2;
  ns.globalRank = Math.max(1, ns.globalRank - jump);
  return ns;
}
function updatePlayerGlobalRankOnLoss(ns, dominated){
  if (!ns.globalRank) return ns;
  const jump = dominated ? randInt(3,6) : randInt(1,3);
  ns.globalRank = Math.min(50, ns.globalRank + jump);
  return ns;
}
function globalRankLabel(r){
  if (r === undefined || r === null) return null;
  if (r === 1) return "🥇 #1 mondial (P4P)";
  return `#${r} mondial (P4P)`;
}

// ---- Sponsors avec objectifs : un contrat verse un revenu récurrent, mais certains exigent
// un objectif précis pour rester valides (sinon rupture du contrat). ----
const SPONSOR_OBJECTIVES = [
  { id:"ko_wins", label:"Gagner par KO", check:(s,before)=> (s.koWins||0) > (before.koWins||0) },
  { id:"three_fights_year", label:"Combattre 3 fois cette année", check:(s,before)=> true }, // suivi via compteur dédié
  { id:"become_champion", label:"Devenir champion", check:(s,before)=> (s.titles||0) > (before.titles||0) },
];
const SPONSOR_DEALS = [
  { id:"equipementier", label:"Équipementier sportif", icon:"👟", weekly:[120,320] },
  { id:"nutrition", label:"Marque de nutrition sportive", icon:"🥤", weekly:[80,220] },
  { id:"boisson_energetique", label:"Boisson énergétique", icon:"⚡", weekly:[100,260] },
  { id:"salle_sport", label:"Chaîne de salles de sport", icon:"🏋️", weekly:[70,180] },
];
// ---- Sponsors "bad boy"/underground : quand la polémique fait fuir un sponsor corporate, ce
// genre d'acteur y voit au contraire une opportunité — contrats bien plus lucratifs, mais assortis
// d'une "clause de scandale" qui entretient la controverse tant que le contrat court. ----
const BAD_BOY_SPONSORS = [
  { id:"paris_sportifs_offshore", label:"Plateforme de paris sportifs offshore", icon:"🎰", weekly:[280,650], weeklyControversy:[2,5] },
  { id:"energy_underground", label:"Marque d'energy drink 'underground'", icon:"🥃", weekly:[220,520], weeklyControversy:[1,4] },
  { id:"streetwear_provoc", label:"Streetwear à l'imagerie provocatrice", icon:"🖤", weekly:[200,480], weeklyControversy:[1,3] },
];
function rollBadBoySponsor(){
  const b = BAD_BOY_SPONSORS[randInt(0, BAD_BOY_SPONSORS.length-1)];
  return { ...b, offeredWeekly: randInt(...b.weekly) };
}

// ---- Style évolutif : le style de combat se façonne selon l'historique de victoires. ----
function computeFightingStyleEvolution(s){
  const ko = (s.koWins||0)+(s.tkoWins||0), sub = s.subWins||0, dec = s.decWins||0;
  const total = ko+sub+dec;
  if (total < 5) return null;
  if (ko >= sub && ko >= dec && ko/total >= 0.45) return { id:"finisseur", label:"Finisseur", desc:"Une réputation de terreur qui cherche la fin du combat à tout instant.", bonus:{ auraBonus:3, hypeBonus:1.5 } };
  if (sub >= ko && sub >= dec && sub/total >= 0.4) return { id:"specialiste_sol", label:"Spécialiste du sol", desc:"Un jeu de soumission qui inquiète tous les grappleurs du circuit.", bonus:{ grapplingWinBonus:6 } };
  if (dec/total >= 0.45) return { id:"technicien", label:"Technicien", desc:"Une science du combat qui gagne les points round après round.", bonus:{ winChanceBonus:3 } };
  return { id:"polyvalent_confirme", label:"MMA complet", desc:"Aucune faiblesse identifiable, un combattant complet.", bonus:{ winChanceBonus:1 } };
}

// Bonus de winChance apporté par le style de combat déjà façonné (voir computeFightingStyleEvolution).
function styleEvolutionWinChanceBonus(s, tactic){
  const evo = computeFightingStyleEvolution(s);
  if (!evo) return 0;
  if (evo.id==="specialiste_sol" && tactic && tactic.focus==="grappling") return evo.bonus.grapplingWinBonus||0;
  if (evo.bonus && evo.bonus.winChanceBonus) return evo.bonus.winChanceBonus;
  return 0;
}

// ---- Équipe d'entraînement vivante : les partenaires de sparring progressent eux aussi, et
// peuvent connaître leur propre carrière en parallèle de la tienne. ----
function generateTrainingPartner(){
  return { name: randName(), level: randInt(1,3), active:true };
}
function initialTrainingPartners(){
  return Array.from({length:3}, generateTrainingPartner);
}
// Fait évoluer l'équipe d'entraînement au fil des semaines : progression, départ, blessure au
// sparring, ou percée vers une grande organisation.
function tickTrainingPartners(ns, weeks){
  if (!ns.trainingPartners || !ns.trainingPartners.length) return { ns, lines:[] };
  let lines = [];
  let partners = ns.trainingPartners.map(p=>({...p}));
  const chancePerWeek = 0.02;
  const rolls = Math.max(1, Math.round(weeks));
  for (let w=0; w<rolls; w++){
    partners = partners.filter(p=>{
      if (!p.active) return true;
      const r = Math.random();
      if (r < chancePerWeek*0.15){
        p.active = false;
        lines.push(`👋 ${p.name}, ton partenaire d'entraînement, quitte la salle pour poursuivre sa carrière ailleurs.`);
        return true;
      }
      if (r < chancePerWeek*0.30){
        p.active = false;
        lines.push(`🤕 ${p.name} te blesse involontairement lors d'un sparring trop intense — heureusement sans gravité pour cette fois.`);
        ns.moral = clamp((ns.moral||70) - 2, 0, 100);
        return true;
      }
      if (r < chancePerWeek*0.45 && p.level>=3){
        p.active = false;
        lines.push(`🚀 ${p.name} signe avec l'UFC avant toi — un rappel que la concurrence ne dort jamais.`);
        return true;
      }
      if (r < chancePerWeek*0.55 && p.level>=3 && Math.random()<0.2){
        p.active = false;
        lines.push(`🏆 ${p.name}, ton ancien partenaire d'entraînement, devient champion dans son organisation — un exemple pour toute la salle.`);
        return true;
      }
      if (r < chancePerWeek){
        p.level = clamp(p.level+1, 1, 5);
      }
      return true;
    });
    if (partners.filter(p=>p.active).length < 2 && Math.random()<0.3){
      partners.push(generateTrainingPartner());
      lines.push(`🤝 Un(e) nouveau/nouvelle partenaire d'entraînement, ${partners[partners.length-1].name}, rejoint la salle.`);
    }
  }
  ns.trainingPartners = partners;
  return { ns, lines };
}

// ---- Villes hôtes par région d'organisation (tirées aléatoirement pour chaque carte) ----
const CITIES_BY_REGION = {
  "France": ["Paris","Lyon","Marseille","Nantes","Bordeaux"],
  "UK/Irlande": ["Londres","Manchester","Dublin","Belfast"],
  "USA": ["Las Vegas","Miami","New York","Denver","Houston","Chicago"],
  "Afrique du Sud": ["Johannesburg","Le Cap","Durban"],
  "Japon": ["Tokyo","Osaka","Nagoya"],
  "Tchéquie/Slovaquie": ["Prague","Bratislava","Brno"],
  "Pologne": ["Varsovie","Cracovie","Gdansk"],
  "Russie": ["Moscou","Saint-Pétersbourg","Grozny"],
  "Russie/Caucase": ["Grozny","Makhatchkala","Vladikavkaz"],
  "Bahreïn/Moyen-Orient": ["Manama","Abou Dabi","Dubaï","Riyad"],
  "Corée du Sud": ["Séoul","Busan"],
  "Amérique latine/USA": ["Mexico","Sao Paulo","Bogota","Miami"],
  "Asie": ["Singapour","Bangkok","Manille","Jakarta"],
  "USA/Europe": ["Dublin","Londres","Uncasville","Paris"],
  "APEX, Las Vegas": ["Las Vegas"],
};
function randomCityFor(org){
  const list = CITIES_BY_REGION[org.region] || ["Las Vegas"];
  return list[randInt(0, list.length-1)];
}

// ---- Difficulté globale : la carrière est volontairement BEAUCOUP plus dure ----
// skillGainMult ralentit toute la progression des stats, injuryMult augmente la fréquence
// des blessures, champTough augmente le niveau des adversaires légendaires/titrés.
// titleChanceMult / titleRepBuffer / minFightsForTitle rendent les combats de titre eux-mêmes
// beaucoup plus rares et exigeants, pour qu'un titre (et a fortiori plusieurs) se mérite sur
// une vraie carrière plutôt qu'en quelques années — devenir champion 8 fois avant 25 ans ne
// doit plus être possible.
const DIFFICULTY = {
  skillGainMult: 0.32,
  injuryMult: 1.9,
  champTough: 1.65,
  lossRepMult: 2.1,
  lossHypeMult: 1.8,
  titleChanceMult: 0.5,
  titleRepBuffer: 22,
  minFightsForTitle: 14,
};

// ---- Coordonnées (lat, lon) approximatives des villes hôtes, pour la carte du monde ----
const CITY_COORDS = {
  "Paris":[48.85,2.35], "Lyon":[45.75,4.85], "Marseille":[43.30,5.37], "Nantes":[47.22,-1.55], "Bordeaux":[44.84,-0.58],
  "Londres":[51.51,-0.13], "Manchester":[53.48,-2.24], "Dublin":[53.35,-6.26], "Belfast":[54.60,-5.93],
  "Las Vegas":[36.17,-115.14], "Miami":[25.76,-80.19], "New York":[40.71,-74.01], "Denver":[39.74,-104.99], "Houston":[29.76,-95.37], "Chicago":[41.88,-87.63],
  "Johannesburg":[-26.20,28.05], "Le Cap":[-33.92,18.42], "Durban":[-29.86,31.02],
  "Tokyo":[35.68,139.69], "Osaka":[34.69,135.50], "Nagoya":[35.18,136.91],
  "Prague":[50.08,14.44], "Bratislava":[48.15,17.11], "Brno":[49.20,16.61],
  "Varsovie":[52.23,21.01], "Cracovie":[50.06,19.94], "Gdansk":[54.35,18.65],
  "Moscou":[55.75,37.62], "Saint-Pétersbourg":[59.93,30.34], "Grozny":[43.32,45.70],
  "Makhatchkala":[42.98,47.50], "Vladikavkaz":[43.02,44.68],
  "Manama":[26.23,50.59], "Abou Dabi":[24.47,54.37], "Dubaï":[25.20,55.27], "Riyad":[24.71,46.68],
  "Séoul":[37.57,126.98], "Busan":[35.18,129.08],
  "Mexico":[19.43,-99.13], "Sao Paulo":[-23.55,-46.63], "Bogota":[4.71,-74.07],
  "Singapour":[1.35,103.82], "Bangkok":[13.76,100.50], "Manille":[14.60,120.98], "Jakarta":[-6.21,106.85],
  "Uncasville":[41.45,-72.09],
};
function cityToXY(city){
  const c = CITY_COORDS[city] || [20,0];
  const [lat,lon] = c;
  const x = clamp(((lon+180)/360)*100, 1, 99);
  const y = clamp(((90-lat)/150)*100, 1, 96);
  return { x, y };
}

// ---- Infos de voyage par région : billet d'avion, hôtel, climat, décalage horaire ----
// Utilisées pour construire la carte du monde et le coût réel d'un déplacement (staff inclus).
const REGION_TRAVEL = {
  "France": { flight:280, hotel:110, climate:"Tempéré", tz:0 },
  "UK/Irlande": { flight:420, hotel:150, climate:"Océanique", tz:-1 },
  "USA": { flight:1350, hotel:220, climate:"Variable", tz:-6 },
  "Afrique du Sud": { flight:1600, hotel:140, climate:"Subtropical", tz:1 },
  "Japon": { flight:2200, hotel:200, climate:"Humide", tz:8 },
  "Tchéquie/Slovaquie": { flight:480, hotel:110, climate:"Continental", tz:0 },
  "Pologne": { flight:460, hotel:100, climate:"Continental", tz:0 },
  "Russie": { flight:900, hotel:160, climate:"Froid", tz:3 },
  "Russie/Caucase": { flight:950, hotel:130, climate:"Montagnard", tz:3 },
  "Bahreïn/Moyen-Orient": { flight:2000, hotel:260, climate:"Désertique", tz:2 },
  "Corée du Sud": { flight:2300, hotel:190, climate:"Humide", tz:8 },
  "Amérique latine/USA": { flight:1800, hotel:170, climate:"Tropical", tz:-5 },
  "Asie": { flight:2500, hotel:150, climate:"Tropical humide", tz:6 },
  "USA/Europe": { flight:900, hotel:180, climate:"Variable", tz:-3 },
  "APEX, Las Vegas": { flight:1350, hotel:220, climate:"Désertique", tz:-8 },
};
function jetlagLabel(tz){
  const abs = Math.abs(tz||0);
  if (abs<=1) return { txt:"Aucun décalage notable", color:"text-emerald-400" };
  if (abs<=4) return { txt:"Décalage léger", color:"text-yellow-400" };
  if (abs<=7) return { txt:"Décalage marqué", color:"text-orange-400" };
  return { txt:"Décalage sévère", color:"text-red-500" };
}
function travelCostsFor(org, s){
  const info = REGION_TRAVEL[org.region] || { flight:1000, hotel:150, climate:"Inconnu", tz:0 };
  const staffCount = (s.hiredStaff||[]).length + 1; // +1 pour le coach principal
  const nights = 5;
  const flight = Math.round(info.flight * (1 + (staffCount-1)*0.35));
  const hotel = Math.round(info.hotel * nights * (1 + (staffCount-1)*0.55));
  const coachTravel = Math.round(staffMonthlyCost(s.hiredStaff) * 0.15 + headCoachById(s.headCoachId).cost * 0.2);
  const total = flight + hotel + coachTravel;
  return { flight, hotel, coachTravel, total, climate: info.climate, tz: info.tz, staffCount };
}

// ---- Position sur la carte de l'événement : préliminaires préliminaires / préliminaires / carte principale ----
function determineCardPosition(org, s, isTitle, legendary){
  const hype = s.hype||20;
  const rep = s.reputation||0;
  if (isTitle || legendary || (org.tier>=4 && rep>=55) || hype>=70) return { key:"main", label:"Carte principale" };
  if (org.tier>=3 || rep>=28 || hype>=40) return { key:"prelim", label:"Carte préliminaire" };
  return { key:"prepre", label:"Carte pré-préliminaire" };
}
function cardPositionColor(key){
  if (key==="main") return "text-yellow-400";
  if (key==="prelim") return "text-sky-400";
  return "text-zinc-500";
}

// ---- Staff / coach principal : recrutable et licenciable en fonction des résultats ----
// skillMult vient s'ajouter au multiplicateur de progression (comme le gym), cost = salaire mensuel.
const HEAD_COACHES = [
  { id:"coach_debutant", name:"Coach de quartier", cost:0, skillMult:1.0, moralStability:1.0,
    desc:"Ton tout premier coach, dévoué mais aux méthodes limitées." },
  { id:"coach_regional", name:"Coach régional expérimenté", cost:900, skillMult:1.15, moralStability:1.1,
    desc:"Un coach solide, rompu aux circuits régionaux." },
  { id:"coach_ancien_pro", name:"Ancien combattant pro reconverti", cost:1600, skillMult:1.3, moralStability:1.05,
    desc:"Son vécu de la compétition irrigue chaque séance." },
  { id:"coach_international", name:"Coach international réputé", cost:2800, skillMult:1.5, moralStability:1.2,
    desc:"Un nom qui inspire respect et exigence, coûteux mais payant." },
  { id:"coach_elite_mondial", name:"Coach d'élite mondiale", cost:4500, skillMult:1.75, moralStability:1.35,
    desc:"Un architecte de champions, sélectif et exigeant." },
];
function headCoachById(id){ return HEAD_COACHES.find(c=>c.id===id) || HEAD_COACHES[0]; }

// ---- Prénoms / noms (grand vivier pour les adversaires générés) ----
const FIRST = ["Karim","Yanis","Thibault","Amine","Kevin","Lucas","Rayan","Nordine","Mathieu","Bilal","Tom","Enzo","Sofiane","Antoine","Adam","Dylan","Younes","Maxime","Ilyes","Romain",
  "Mehdi","Bastien","Alexis","Cedric","Jordan","Steven","Anthony","Florian","Guillaume","Nicolas","Quentin","Hugo","Baptiste","Loic","Ismael","Souleymane","Moussa","Ibrahim","Ousmane","Cheikh",
  "Aleksandar","Dragan","Milos","Stefan","Andrei","Vlad","Igor","Dmitri","Sergei","Pavel","Marek","Tomasz","Wojciech","Bartek","Kacper",
  "Rui","Joao","Diego","Mateus","Rodrigo","Bruno","Thiago","Gustavo",
  "Hiroshi","Takeshi","Ryo","Daiki","Kenta","Minh","Duc","Tuan",
  "Arjun","Ravi","Amir","Farid","Hassan","Yusuf","Tariq","Malik","Jamal",
  "Andre","Marcus","Devon","Tyrell","Connor","Liam","Ethan","Owen"];
const LAST = ["Belkacem","Moreau","Diallo","Fontaine","Rossi","Kowalski","Petit","Novak","Lambert","Traoré","Girard","Vasquez","Nowak","Simic","Ferreira","Costa","Renault","Idrissi","Marchetti","Weber",
  "Duval","Lefevre","Chevalier","Perrot","Boucher","Garnier","Faure","Barbier","Robin","Michel",
  "Bianchi","Ricci","Conti","Greco","Marino","Silva","Santos","Oliveira","Almeida","Carvalho","Pereira",
  "Nowicki","Zielinski","Wojcik","Lis","Krol","Ivanovic","Petrovic","Jovanovic","Popovic","Volkov","Orlov","Smirnov","Popov",
  "Sato","Suzuki","Watanabe","Yamamoto","Tanaka","Nguyen","Tran","Pham","Le","Hoang",
  "Khan","Ahmed","Mansour","Haddad","Osei","Mensah","Boateng","Adjei","Diarra","Toure","Keita","Sissoko"];
// ---- Prénoms / noms féminins (utilisés quand le joueur choisit "Femme", pour générer des adversaires cohérentes) ----
const FIRST_F = ["Sarah","Manon","Léa","Camille","Inès","Sofia","Chloé","Emma","Jade","Zoé",
  "Nawel","Sabrina","Yasmine","Farida","Amel","Mélissa","Laura","Julie","Marion","Céline",
  "Aleksandra","Katarina","Ivana","Milena","Andreea","Ioana","Nadia","Ewa","Kasia","Zofia",
  "Mariana","Beatriz","Carolina","Fernanda","Larissa","Camila",
  "Yuki","Aiko","Sakura","Linh","Huyen",
  "Priya","Leila","Samira","Zahra","Noor",
  "Ashley","Destiny","Chelsea","Brianna"];
const LAST_F = ["Belkacem","Moreau","Diallo","Fontaine","Rossi","Kowalski","Petit","Novak","Lambert","Traoré",
  "Girard","Vasquez","Nowak","Simic","Ferreira","Costa","Renault","Idrissi","Marchetti","Weber",
  "Duval","Lefèvre","Chevalier","Perrot","Boucher","Garnier","Faure","Barbier","Robin","Michel",
  "Bianchi","Ricci","Conti","Greco","Marino","Silva","Santos","Oliveira","Almeida","Carvalho",
  "Nowicki","Zieliński","Wójcik","Ivanovic","Petrovic","Jovanovic","Popovic","Volkov","Smirnov",
  "Sato"];
function randName(gender){
  const F = gender === "femme" ? FIRST_F : FIRST;
  const L = gender === "femme" ? LAST_F : LAST;
  return F[Math.floor(Math.random()*F.length)] + " " + L[Math.floor(Math.random()*L.length)];
}

// ---- Rosters personnalisés : le joueur peut importer une vraie liste de combattants par
// organisation (générée facilement avec une IA) pour remplacer une partie des adversaires
// aléatoires par des noms réels. Stocké en state (customRosters: { orgId: [noms...] }) et
// persisté via window.storage pour survivre d'une carrière à l'autre. ----
function normalizeLabel(s){
  return (s||"").toString().normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"");
}
function matchOrgByLabel(label){
  const norm = normalizeLabel(label);
  if (!norm) return null;
  let found = ORGS.find(o=>normalizeLabel(o.id)===norm || normalizeLabel(o.name)===norm);
  if (found) return found;
  found = ORGS.find(o=>norm.includes(normalizeLabel(o.id)) || normalizeLabel(o.name).includes(norm) || norm.includes(normalizeLabel(o.name)));
  return found || null;
}
// Accepte deux formats :
// 1) JSON : { "UFC": ["Nom 1","Nom 2"], "Bellator": ["Nom 3", ...] }
// 2) Texte ligne par ligne : "UFC: Nom 1, Nom 2, Nom 3" (un ":" ou " - " sépare l'organisation des noms)
function parseRosterInput(text){
  const result = {};
  let obj = null;
  try { obj = JSON.parse(text); } catch(e){ obj = null; }
  if (obj && typeof obj === "object" && !Array.isArray(obj)){
    Object.keys(obj).forEach(key=>{
      const org = matchOrgByLabel(key);
      const raw = obj[key];
      const list = Array.isArray(raw) ? raw : String(raw||"").split(",");
      const names = list.map(n=>String(n).trim()).filter(Boolean);
      if (org && names.length) result[org.id] = (result[org.id]||[]).concat(names);
    });
    return result;
  }
  String(text||"").split("\n").forEach(line=>{
    const colonIdx = line.indexOf(":");
    const dashIdx = line.indexOf(" - ");
    const sepIdx = colonIdx >= 0 ? colonIdx : dashIdx;
    if (sepIdx < 0) return;
    const label = line.slice(0, sepIdx).trim();
    const rest = line.slice(sepIdx + (colonIdx>=0?1:3)).trim();
    if (!label || !rest) return;
    const org = matchOrgByLabel(label);
    if (!org) return;
    const names = rest.split(",").map(n=>n.trim()).filter(Boolean);
    if (names.length) result[org.id] = (result[org.id]||[]).concat(names);
  });
  return result;
}
// Exemple de prompt à copier-coller dans une IA pour générer une liste au bon format.
const ROSTER_PROMPT_EXAMPLE = `Donne-moi une liste de vrais combattants de MMA actuels ou historiques, organisée par organisation, au format suivant exactement (une ligne par organisation, noms séparés par des virgules) :

UFC: Nom 1, Nom 2, Nom 3, ...
Bellator: Nom 1, Nom 2, ...
ONE Championship: Nom 1, Nom 2, ...

Organisations possibles : ${ORGS.map(o=>o.name).join(", ")}.
Mets 10 à 20 noms par organisation.`;

// ---- Combattants légendaires (adversaires spéciaux en haut de classement / combats de titre) ----
const LEGENDS = [
  { name:"Marek \"Le Bourreau\" Zajac", tag:"Ancien champion" },
  { name:"Solomon Okafor", tag:"Invaincu depuis 12 combats" },
  { name:"Iron Viktor Sokolov", tag:"Légende vivante" },
  { name:"Hana Takeda", tag:"Triple championne", gender:"F" },
  { name:"Djibril \"Le Sniper\" Coulibaly", tag:"Meilleur frappeur du circuit" },
  { name:"Bruno \"Anaconda\" Silveira", tag:"Roi de la soumission" },
  { name:"Katarina Novikova", tag:"Ceinture incontestée", gender:"F" },
  { name:"Big Sione Tuilagi", tag:"Puncheur redouté" },
  { name:"Idris El Amrani", tag:"Ancien prétendant n°1" },
  { name:"Wade \"Cyclone\" Harrington", tag:"Recordman de KO" },
  { name:"Mireille Dubois-Leclerc", tag:"Pionnière du circuit féminin", gender:"F" },
  { name:"Kenji Nakashima", tag:"Maître du judo-MMA" },
  { name:"Zurab Beridze", tag:"Champion incontesté" },
  { name:"Chidi Emeka", tag:"Phénomène monté en puissance" },
  { name:"Anders \"Le Viking\" Solberg", tag:"Vétéran redouté" },
  { name:"Paloma Reyes", tag:"Reine du Featherweight", gender:"F" },
  { name:"Tarek Bensalem", tag:"Légende locale invaincue" },
  { name:"Grigor Ivanov", tag:"Ex-champion multi-organisations" },
  // ---- Combattants "stars" additionnels : entièrement fictifs, en haut de classement de leur
  // organisation, utilisés comme adversaires redoutables en fin de carrière / gros tiers. ----
  { name:"Dagor Aliyev", tag:"Numéro 1 mondial Pound-for-Pound (fictif)" },
  { name:"Marcus \"Steel\" Whitfield", tag:"Champion Flyweight (fictif)" },
  { name:"Temuri Basilashvili", tag:"Top Bantamweight (fictif)" },
  { name:"Ryder Callahan", tag:"Bantamweight en pleine ascension (fictif)" },
  { name:"Otar Chikovani", tag:"Bantamweight redouté (fictif)" },
  { name:"Danylo Petrenko", tag:"Ancien champion Bantamweight (fictif)" },
  { name:"Kaito Miyahara", tag:"Flyweight technique (fictif)" },
  { name:"Ezekiel Okonjo", tag:"Flyweight puissant (fictif)" },
  { name:"Rustam Gadjiyev", tag:"Champion Featherweight (fictif)" },
  { name:"Owen \"The BMF\" Radcliffe", tag:"Détenteur d'une ceinture symbolique (fictif)" },
  { name:"Aslan Tsereteli", tag:"Lightweight en forme (fictif)" },
  { name:"Marco Belluci", tag:"Ancien champion Lightweight (fictif)" },
  { name:"Théo Delacroix", tag:"Featherweight offensif (fictif)" },
  { name:"Idriss Fofana", tag:"Featherweight technique (fictif)" },
  { name:"Cole Bannister", tag:"Lightweight cogneur (fictif)" },
  { name:"Milan Petrović", tag:"Lightweight solide (fictif)" },
  { name:"Emeka Duru", tag:"Welterweight émergent (fictif)" },
  { name:"Ravshan Yusupov", tag:"Welterweight (fictif)" },
  { name:"Dries Van Damme", tag:"Ancien champion Middleweight (fictif)" },
  { name:"Kofi Adjaye", tag:"Ancien champion Middleweight (fictif)" },
  { name:"Leandro Ferraz", tag:"Ancien champion Welterweight (fictif)" },
  { name:"Bakhtiyar Suleimanov", tag:"Welterweight tranchant (fictif)" },
  { name:"Nicolae Popescu", tag:"Middleweight technique (fictif)" },
  { name:"Andries Botha", tag:"Welterweight (fictif)" },
  { name:"Reggie Vance", tag:"Welterweight puncheur (fictif)" },
  { name:"Sione Faleolo", tag:"Welterweight explosif (fictif)" },
  { name:"Dante Marchetti", tag:"Middleweight (fictif)" },
  { name:"Callum Fitzgerald", tag:"Middleweight en série (fictif)" },
  { name:"Vitaliy Marchenko", tag:"Champion Light Heavyweight (fictif)" },
  { name:"Tomasz Grzegorczyk", tag:"Champion Heavyweight (fictif)" },
  { name:"Baptiste Aurelio", tag:"Légende vivante toutes catégories (fictif)" },
  { name:"Jerome Attah", tag:"Heavyweight redouté (fictif)" },
  { name:"Magnus Ekstrom", tag:"Light Heavyweight (fictif)" },
  { name:"Jarrah Novak", tag:"Light Heavyweight (fictif)" },
  { name:"Yerlan Bekov", tag:"Heavyweight (fictif)" },
  { name:"Denis Voloshyn", tag:"Heavyweight (fictif)" },
  { name:"Halil Demirtas", tag:"Light Heavyweight (fictif)" },
  { name:"Wiktor Zalewski", tag:"Light Heavyweight (fictif)" },
  { name:"Trent Osei-Bonsu", tag:"Light Heavyweight (fictif)" },
  { name:"Marek Ondracek", tag:"Light Heavyweight (fictif)" },
  { name:"Cyrus Anand", tag:"Heavyweight technique (fictif)" },
  { name:"Petr Vaculik", tag:"Heavyweight (fictif)" },
  { name:"Ludovic Amboise", tag:"Heavyweight (fictif)" },
  { name:"Yekaterina Volkova", tag:"Championne Flyweight féminin (fictif)", gender:"F" },
  { name:"Mei Fujimoto", tag:"Championne Strawweight féminin (fictif)", gender:"F" },
  { name:"Bianca Odhiambo", tag:"Poids plume féminin (fictif)", gender:"F" },
  { name:"Carys Bevan", tag:"Flyweight féminin (fictif)", gender:"F" },
  { name:"Aiyana Whitehorse", tag:"Flyweight féminin (fictif)", gender:"F" },
  { name:"Nadia Cristescu", tag:"Flyweight féminin (fictif)", gender:"F" },
  { name:"Priya Chandrasekaran", tag:"Strawweight féminin (fictif)", gender:"F" },
  { name:"Ingrid Dahlberg", tag:"Strawweight féminin (fictif)", gender:"F" },
  { name:"Solene Marchand", tag:"Strawweight féminin (fictif)", gender:"F" },
  { name:"Fanele Mahlangu", tag:"Champion multi-catégories (fictif)" },
  { name:"Boris Sarapkin", tag:"Champion toutes organisations confondues (fictif)" },
];


// ---- Tactiques de combat (choix à faire avant chaque combat) ----
const TACTICS = [
  { id:"pression", name:"Pression debout", focus:"boxe", desc:"Multiplier les échanges pour chercher le KO.", winWeight:0.28, healthMult:1.2, energyMult:1.15, injuryMult:1.25, skillMult:1.3, reputationMult:1.15 },
  { id:"controle", name:"Contrôle et lutte", focus:"lutte", desc:"Plaquer et étouffer l'adversaire au sol.", winWeight:0.28, healthMult:0.85, energyMult:1.05, injuryMult:0.85, skillMult:1.1, reputationMult:0.8 },
  { id:"soumission", name:"Jeu de soumission", focus:"grappling", desc:"Chercher la finition via clés et étranglements.", winWeight:0.28, healthMult:0.9, energyMult:1.0, injuryMult:0.9, skillMult:1.2, reputationMult:1.05 },
  { id:"prudence", name:"Attentisme technique", focus:null, desc:"Gérer la distance, limiter les risques au maximum.", winWeight:0.0, healthMult:0.7, energyMult:0.8, injuryMult:0.65, skillMult:0.7, reputationMult:0.7 },
];

function tacticWinDelta(tactic, s){
  let delta;
  if (!tactic.focus) delta = (s.mental-70)*0.1 + (s.cardio-70)*0.05;
  else {
    const focusVal = s[tactic.focus];
    const others = ["boxe","grappling","lutte"].filter(k=>k!==tactic.focus).reduce((a,k)=>a+s[k],0)/2;
    delta = (focusVal - others) * tactic.winWeight;
  }
  // Les adversaires analysent tes derniers combats : une même tactique jouée 3 fois de suite
  // est lue et contrée (l'effet de surprise disparaît totalement).
  const recent = s.recentTactics||[];
  if (recent.length>=2 && recent[recent.length-1]===tactic.id && recent[recent.length-2]===tactic.id){
    delta -= 7;
  }
  return delta;
}

// ---- Trashtalk : choix d'attitude médiatique avant le combat ----
// Conférence de presse en DEUX temps (approche initiale + réplique) : les conséquences sont
// désormais lourdes — hype, aura, moral, winChance ET bourse (via purseMult) sont tous en jeu,
// avec un vrai risque de retour de bâton si le pari médiatique échoue.
const TRASHTALK = [
  { id:"provoc", name:"Provocation frontale", desc:"Tu humilies ton adversaire en conférence de presse.",
    hype:[16,28], winChance:[-10,16], aura:[3,9], moral:[-3,6], purseMult:[1.10,1.40], riskChance:0.4,
    successLine:"Le clash fait exploser le buzz : la salle sera bouillante et tu montes en confiance.",
    failLine:"Ça se retourne violemment contre toi : l'adversaire arrive galvanisé et concentré." },
  { id:"respect", name:"Respect sportif", desc:"Tu joues la carte de l'élégance et du fair-play.",
    hype:[3,9], winChance:[2,7], aura:[2,5], moral:[5,9], purseMult:[1.0,1.1], riskChance:0.05,
    successLine:"Ton attitude posée rassure ton camp et calme le jeu.",
    failLine:"Ton calme est perçu comme un manque de conviction par certains médias." },
  { id:"mental", name:"Guerre psychologique ciblée", desc:"Tu vises un point sensible précis de l'adversaire.",
    hype:[10,20], winChance:[-6,22], aura:[2,7], moral:[0,5], purseMult:[1.05,1.3], riskChance:0.35,
    successLine:"Le coup porte en plein cœur : tu vois le doute s'installer chez lui.",
    failLine:"Le coup rate sa cible et se retourne violemment contre ton image." },
  { id:"silence", name:"Silence médiatique", desc:"Tu refuses tout affrontement verbal, tu laisses parler l'octogone.",
    hype:[-6,3], winChance:[0,5], aura:[0,2], moral:[2,5], purseMult:[0.95,1.02], riskChance:0.0,
    successLine:"Discret mais concentré, tu arrives à ce combat l'esprit clair.",
    failLine:"Discret mais concentré, tu arrives à ce combat l'esprit clair." },
];
function resolveTrashtalk(tt, s){
  const success = Math.random() >= tt.riskChance;
  const sign = success ? 1 : -1;
  const hypeGain = sign>0 ? rand(...tt.hype) : -rand(2, Math.max(3,tt.hype[1]));
  const winDelta = success ? rand(Math.max(0,tt.winChance[0]), tt.winChance[1]) : Math.min(0, tt.winChance[0]) - rand(3,10);
  const auraDelta = success ? rand(...tt.aura) : -rand(0,4);
  const moralDelta = success ? rand(...tt.moral) : -rand(2,5);
  const purseMult = success ? rand(...tt.purseMult) : Math.max(0.82, tt.purseMult[0]-0.18);
  return {
    hypeDelta: hypeGain, winDelta, auraDelta, moralDelta, purseMult,
    line: success ? tt.successLine : tt.failLine,
  };
}

// ---- Réplique : deuxième temps de la conférence de presse ----
// Après l'approche initiale, l'adversaire répond — le joueur choisit comment refermer l'échange.
// Les effets s'additionnent à ceux du premier choix : la conférence pèse donc lourd sur le combat.
const REBUTTALS = [
  { id:"enfoncer", name:"Enfoncer le clou", desc:"Tu remets une couche, tu veux la dernière punchline.",
    hype:[8,16], winChance:[-8,14], aura:[2,5], moral:[-1,3], purseMult:[1.05,1.25], riskChance:0.45,
    successLine:"Le clash devient viral : l'affiche s'emballe et les guichets s'arrachent.",
    failLine:"Tu en fais trop : la sympathie du public bascule du côté adverse." },
  { id:"calmer", name:"Recentrer sur le sport", desc:"Tu ramènes le débat sur le combat lui-même, avec assurance.",
    hype:[2,6], winChance:[2,6], aura:[1,3], moral:[2,5], purseMult:[0.98,1.08], riskChance:0.1,
    successLine:"Ton sérieux impressionne les observateurs et rassure ton équipe.",
    failLine:"Ton calme est pris pour de la timidité par certains commentateurs." },
  { id:"sourire", name:"Sourire et confiance silencieuse", desc:"Tu laisses planer un sourire, sans un mot de plus.",
    hype:[0,4], winChance:[1,5], aura:[2,6], moral:[1,4], purseMult:[1.0,1.1], riskChance:0.05,
    successLine:"Ton assurance tranquille intrigue et fascine les médias.",
    failLine:"Ton silence est interprété comme un manque de répondant." },
];
function resolveRebuttal(rb, s){
  const success = Math.random() >= rb.riskChance;
  const sign = success ? 1 : -1;
  const hypeGain = sign>0 ? rand(...rb.hype) : -rand(1, Math.max(2,rb.hype[1]));
  const winDelta = success ? rand(Math.max(0,rb.winChance[0]), rb.winChance[1]) : Math.min(0, rb.winChance[0]) - rand(2,8);
  const auraDelta = success ? rand(...rb.aura) : -rand(0,3);
  const moralDelta = success ? rand(...rb.moral) : -rand(1,4);
  const purseMult = success ? rand(...rb.purseMult) : Math.max(0.85, rb.purseMult[0]-0.1);
  return {
    hypeDelta: hypeGain, winDelta, auraDelta, moralDelta, purseMult,
    line: success ? rb.successLine : rb.failLine,
  };
}

// ---- Vie personnelle : en dehors de la cage, une vie continue de se dérouler. Rencontre, mariage,
// naissance, divorce, décès d'un proche, déménagement, problèmes financiers — tout ça pèse
// réellement sur le moral (et parfois sur les finances), indépendamment des résultats sportifs. ----
const LIFE_EVENTS = [
  { id:"rencontre", label:(n)=>`💞 Tu fais une rencontre qui compte : le début d'une relation sérieuse.`,
    cond:(s)=> (s.relationshipStatus||"célibataire")==="célibataire", chance:0.012,
    apply:(ns)=>{ ns.relationshipStatus = "en couple"; ns.moral = clamp(ns.moral+rand(4,9),0,100); } },
  { id:"mariage", label:(n)=>`💍 Tu te maries — une belle cérémonie, entourée de tes proches.`,
    cond:(s)=> s.relationshipStatus==="en couple", chance:0.007,
    apply:(ns)=>{ ns.relationshipStatus = "marié(e)"; ns.moral = clamp(ns.moral+rand(8,16),0,100); ns.aura=clamp((ns.aura||0)+rand(1,3),0,100); ns.money = Math.max(0, ns.money - randInt(2000,7000)); } },
  { id:"enfant", label:(n)=>`👶 Naissance : tu deviens parent. Ta vie change du tout au tout.`,
    cond:(s)=> (s.relationshipStatus==="marié(e)"||s.relationshipStatus==="en couple") && (s.children||0) < 3, chance:0.009,
    apply:(ns)=>{ ns.children = (ns.children||0)+1; ns.moral = clamp(ns.moral+rand(6,14),0,100); ns.familyWeeklyCost = (ns.familyWeeklyCost||0) + randInt(25,55); ns.energie = clamp(ns.energie - rand(2,6), 0, 100); } },
  { id:"divorce", label:(n)=>`💔 Divorce : une page se tourne, difficilement.`,
    cond:(s)=> s.relationshipStatus==="marié(e)", chance:0.004,
    apply:(ns)=>{ ns.relationshipStatus = "divorcé(e)"; ns.moral = clamp(ns.moral-rand(10,20),0,100); ns.money = Math.max(0, ns.money - randInt(3000,12000)); } },
  { id:"deces_proche", label:(n)=>`🕯️ Tu perds un proche. Un coup dur, loin des projecteurs.`,
    cond:()=>true, chance:0.004,
    apply:(ns)=>{ ns.moral = clamp(ns.moral-rand(10,20),0,100); ns.energie = clamp(ns.energie-rand(3,8),0,100); } },
  { id:"demenagement", label:(n)=>`📦 Déménagement : nouveau départ, nouvelle organisation à trouver.`,
    cond:()=>true, chance:0.006,
    apply:(ns)=>{ ns.moral = clamp(ns.moral+rand(-3,4),0,100); ns.money = Math.max(0, ns.money - randInt(800,2500)); } },
  { id:"problemes_financiers", label:(n)=>`💸 Problèmes financiers imprévus (réparation, imprévu familial, démarche administrative).`,
    cond:()=>true, chance:0.006,
    apply:(ns)=>{ ns.moral = clamp(ns.moral-rand(4,9),0,100); ns.money = Math.max(0, ns.money - randInt(500,3000)); } },
];
function maybeRollLifeEvent(ns){
  const candidates = LIFE_EVENTS.filter(e=>e.cond(ns));
  for (const ev of candidates){
    if (Math.random() < ev.chance){
      ev.apply(ns);
      return ev.label();
    }
  }
  return null;
}

// ---- Réseaux sociaux : Instagram, TikTok, X, YouTube — chaque publication peut faire gagner des
// fans, faire perdre des sponsors, créer une polémique, ou lancer une rivalité. Limité à 2
// publications par semaine pour éviter le spam. ----
// Seuil d'abonnés à partir duquel les publications sponsorisées rapportent réellement de l'argent —
// en dessous, l'audience est jugée trop faible pour intéresser les partenaires commerciaux.
const SOCIAL_MONEY_MIN_FOLLOWERS = 100000;
const SOCIAL_PLATFORMS = [
  { id:"instagram", name:"Instagram", icon:"📸" },
  { id:"tiktok", name:"TikTok", icon:"🎵" },
  { id:"x", name:"X (Twitter)", icon:"🐦" },
  { id:"youtube", name:"YouTube", icon:"▶️" },
];
const SOCIAL_POSTS = [
  { id:"training", label:"Clip d'entraînement", desc:"Tu postes un extrait d'une séance intense en salle.",
    followerGain:[200,900], hypeGain:[1,4], controversyDelta:[-1,1], sponsorRisk:0.02, rivalRisk:0, moralGain:[0,2] },
  { id:"lifestyle", label:"Moment de vie", desc:"Un aperçu de ta vie en dehors de la cage.",
    followerGain:[150,700], hypeGain:[0,3], controversyDelta:[-2,0], sponsorRisk:0.0, rivalRisk:0, moralGain:[1,4] },
  { id:"clash", label:"Clash verbal envers un adversaire", desc:"Tu balances une pique bien sentie sur les réseaux.",
    followerGain:[400,1800], hypeGain:[4,10], controversyDelta:[3,10], sponsorRisk:0.08, rivalRisk:0.22, moralGain:[-1,2] },
  { id:"polemique", label:"Prise de position polémique", desc:"Tu partages une opinion clivante — ça va faire parler.",
    followerGain:[-500,2400], hypeGain:[3,14], controversyDelta:[12,28], sponsorRisk:0.22, rivalRisk:0.05, moralGain:[-3,2] },
  { id:"promo", label:"Promotion d'un partenaire", desc:"Tu mets en avant un sponsor sur ton compte.",
    followerGain:[80,400], hypeGain:[0,2], controversyDelta:[0,0], sponsorRisk:0.0, rivalRisk:0, moralGain:[0,1], moneyGain:[150,600] },
];
function resolveSocialPost(post, currentFollowers){
  const followers = randInt(...post.followerGain);
  const hype = rand(...post.hypeGain);
  const controversy = rand(...post.controversyDelta);
  const moral = rand(...post.moralGain);
  const money = (post.moneyGain && (currentFollowers||0) >= SOCIAL_MONEY_MIN_FOLLOWERS) ? randInt(...post.moneyGain) : 0;
  const sponsorHit = Math.random() < post.sponsorRisk;
  const rivalSpark = Math.random() < post.rivalRisk;
  return { followers, hype, controversy, moral, money, sponsorHit, rivalSpark };
}
function followersLabel(n){
  if (n>=1000000) return (n/1000000).toFixed(1).replace(".0","")+"M";
  if (n>=1000) return Math.round(n/1000)+"k";
  return String(n);
}

// ---- Incidents de conférence de presse : environ une fois sur trois, la conférence ne s'arrête
// pas à la réplique — un événement supplémentaire vient corser l'échange médiatique. ----
const PRESSER_INCIDENTS = [
  { id:"journaliste", label:"Un journaliste te pose une question piège sur ta préparation ou ton dernier revers.",
    choices:[
      { label:"Répondre avec assurance", hype:[3,8], winChance:[1,4], aura:[1,3], moral:[1,3], purseMult:[1.0,1.05] },
      { label:"Éluder poliment", hype:[0,3], winChance:[0,2], aura:[0,1], moral:[0,2], purseMult:[1.0,1.02] },
      { label:"S'énerver face à la question", hype:[6,14], winChance:[-6,2], aura:[-2,2], moral:[-4,0], purseMult:[1.02,1.15] },
    ]},
  { id:"altercation", label:"L'adversaire s'approche trop près pendant la séance photo : l'altercation menace d'éclater.",
    choices:[
      { label:"Rester impassible", hype:[2,6], winChance:[1,4], aura:[2,5], moral:[1,3], purseMult:[1.0,1.05] },
      { label:"Le repousser fermement", hype:[8,16], winChance:[-4,10], aura:[1,4], moral:[-1,3], purseMult:[1.08,1.25] },
      { label:"Répondre à la provocation", hype:[10,20], winChance:[-10,8], aura:[-1,3], moral:[-3,2], purseMult:[1.1,1.35] },
    ]},
  { id:"faceoff_interrompu", label:"Le face-off est interrompu par la sécurité avant même que vous ne vous touchiez.",
    choices:[
      { label:"Hausser les épaules, sourire", hype:[1,5], winChance:[0,3], aura:[1,3], moral:[1,3], purseMult:[1.0,1.03] },
      { label:"Protester contre l'organisation", hype:[4,10], winChance:[-2,4], aura:[-1,2], moral:[-1,2], purseMult:[1.0,1.1] },
    ]},
  { id:"bousculade", label:"Une bousculade éclate entre les deux camps près de la scène.",
    choices:[
      { label:"Rester en retrait, laisser ton camp gérer", hype:[2,6], winChance:[0,3], aura:[0,2], moral:[0,2], purseMult:[1.0,1.05] },
      { label:"T'interposer physiquement", hype:[10,18], winChance:[-8,6], aura:[2,5], moral:[-2,3], purseMult:[1.1,1.3] },
    ]},
  { id:"bouteille", label:"Une bouteille est lancée depuis le public en direction de la scène — la sécurité intervient aussitôt.",
    choices:[
      { label:"Garder ton calme devant les caméras", hype:[3,9], winChance:[0,3], aura:[2,5], moral:[0,3], purseMult:[1.02,1.1] },
      { label:"Pointer du doigt le geste, indigné", hype:[6,14], winChance:[-2,4], aura:[-1,2], moral:[-1,2], purseMult:[1.05,1.2] },
    ]},
];
function resolvePresserIncident(choice){
  return {
    hypeDelta: rand(...choice.hype), winDelta: rand(...choice.winChance),
    auraDelta: rand(...choice.aura), moralDelta: rand(...choice.moral), purseMult: rand(...choice.purseMult),
  };
}

// ---- Conférence de presse D'APRÈS-COMBAT : quasi systématique après un combat de titre, fréquente
// sinon. À la différence du Trashtalk d'avant-combat, elle ne change plus l'issue du combat (déjà
// joué) mais pèse sur hype, aura et moral pour la suite de la carrière — et peut se retourner
// contre toi si le pari médiatique échoue. ----
const POSTFIGHT_PRESSER_WIN = [
  { id:"humble", label:"Rester humble et saluer l'adversaire", hype:[2,6], aura:[3,7], moral:[3,7] },
  { id:"provoc_next", label:"Savourer et défier ton prochain adversaire", hype:[8,16], aura:[-2,3], moral:[2,5], riskChance:0.25,
    failLine:"Ton coup de sang après-combat passe mal auprès des médias." },
  { id:"dedicace", label:"Dédier cette victoire à tes proches", hype:[1,4], aura:[1,3], moral:[6,11] },
];
const POSTFIGHT_PRESSER_LOSS = [
  { id:"digne", label:"Rester digne et féliciter l'adversaire", hype:[0,3], aura:[2,5], moral:[2,5] },
  { id:"excuses", label:"Évoquer une préparation perturbée", hype:[2,6], aura:[-4,0], moral:[-2,3], riskChance:0.4,
    failLine:"Chercher des excuses en public ne convainc personne — ton image en prend un coup." },
  { id:"revanche", label:"Réclamer directement la revanche", hype:[5,12], aura:[0,3], moral:[3,7], riskChance:0.15,
    failLine:"Ta demande de revanche est perçue comme un manque de respect du résultat." },
];
function resolvePostFightPresser(choice){
  const success = !choice.riskChance || Math.random() >= choice.riskChance;
  const hypeDelta = success ? rand(...choice.hype) : -rand(1, Math.max(2,choice.hype[1]));
  const auraDelta = success ? rand(...choice.aura) : -rand(0,4);
  const moralDelta = success ? rand(...choice.moral) : -rand(2,6);
  return { hypeDelta, auraDelta, moralDelta, success, failLine: choice.failLine };
}

// ---- Moments décisifs en cours de combat (choix additionnel, parfois) ----
const MOMENTS = [
  { prompt:"Tu sens une ouverture nette en fin de round.", choices:[
    { label:"Tenter la finition immédiatement", risky:true, winDelta:14, failPenalty:-10, line:"Tu t'es livré à fond sur l'ouverture." },
    { label:"Rester patient et sécuriser les points", risky:false, winDelta:3, failPenalty:0, line:"Tu restes prudent malgré l'occasion." },
  ]},
  { prompt:"Ton adversaire commence à fatiguer visiblement.", choices:[
    { label:"Mettre le pied sur l'accélérateur", risky:true, winDelta:12, failPenalty:-8, line:"Tu enfonces le clou sur un adversaire cuit." },
    { label:"Continuer ton plan initial", risky:false, winDelta:4, failPenalty:0, line:"Tu ne changes rien à ta stratégie." },
  ]},
  { prompt:"Tu encaisses un coup dur qui t'ébranle.", choices:[
    { label:"Répondre par l'agressivité pour rassurer l'arbitre", risky:true, winDelta:8, failPenalty:-14, line:"Tu réponds coûte que coûte, quitte à te mettre en danger." },
    { label:"Te réfugier dans un jeu défensif le temps de récupérer", risky:false, winDelta:2, failPenalty:-2, line:"Tu temporises pour retrouver tes esprits." },
  ]},
  { prompt:"L'arbitre te prévient pour passivité.", choices:[
    { label:"Relancer l'action offensivement", risky:true, winDelta:9, failPenalty:-9, line:"Tu forces l'action pour éviter la sanction." },
    { label:"Ignorer l'avertissement et rester sur ton plan", risky:false, winDelta:0, failPenalty:-3, line:"Tu restes sur ta ligne, au risque de perdre des points." },
  ]},
];

function resolveMomentChoice(choice, s){
  if (choice.risky){
    const successChance = clamp(50 + (s.mental-70)*0.4 + (s.cardio-70)*0.2, 20, 85);
    const success = Math.random()*100 < successChance;
    return {
      winDelta: success ? choice.winDelta : choice.failPenalty,
      extraHealth: success ? 0 : -6,
      line: choice.line + (success ? " Ça paie." : " Ça se retourne contre toi."),
    };
  }
  return { winDelta: choice.winDelta, extraHealth: 0, line: choice.line };
}

// ---- Techniques à découvrir (une cinquantaine, débloquées selon le style et les choix de carrière) ----
// ---- Arbre passif : perks permanents, indépendants des techniques actives, achetés avec les
// mêmes points de technique. Chacun n'est acheté qu'une fois. ----
const PASSIVE_PERKS = [
  { id:"cardio_acier", label:"🫁 Cardio d'acier", cost:4, desc:"Réduit nettement la pénalité de fatigue quand ton énergie tombe sous 25%." },
  { id:"guerrier_cage", label:"🛡️ Guerrier de la cage", cost:4, desc:"Réduit la perte de moral en cas de défaite par décision partagée." },
  { id:"vendeur_ppv", label:"🎤 Vendeur de PPV", cost:5, desc:"Multiplie les gains de hype lors des conférences de presse et provocations." },
];

// ---- Synergies de style hybride : combiner assez de techniques de deux disciplines complémentaires
// débloque un bonus permanent de chance de victoire, matérialisant un vrai style de combat. ----
const STYLE_SYNERGIES = [
  { id:"daghestani", label:"🥋 Lutteur Daghestanais", desc:"Lutte + contrôle au sol : une fois le combat au clinch ou au tapis, la domination devient totale.",
    need:{ lutte:4, grappling:2 }, winChanceBonus:4 },
  { id:"ambidextre", label:"🥊 Striker Ambidextre", desc:"Boxe complète + high kicks : un arsenal debout imprévisible, difficile à lire pour l'adversaire.",
    need:{ boxe:5 }, winChanceBonus:4 },
];
function activeSynergies(s){
  const counts = {};
  (s.discoveredTechniques||[]).forEach(id=>{
    const t = TECHNIQUES.find(x=>x.id===id);
    if (t) counts[t.discipline] = (counts[t.discipline]||0) + 1;
  });
  return STYLE_SYNERGIES.filter(syn => Object.entries(syn.need).every(([disc,n]) => (counts[disc]||0) >= n));
}
function synergyWinChanceBonus(s){
  return activeSynergies(s).reduce((a,syn)=>a+syn.winChanceBonus, 0);
}

const TECHNIQUES = [
  // Boxe / frappe (15)
  { id:"jab", name:"Jab piston", discipline:"boxe", tier:1, desc:"Un jab répété qui casse le rythme adverse." },
  { id:"direct", name:"Direct du droit chirurgical", discipline:"boxe", tier:1, desc:"Frappe directe, précise et rapide." },
  { id:"crochetcorps", name:"Crochet au corps", discipline:"boxe", tier:1, desc:"Attaque le foie pour couper les jambes adverses." },
  { id:"lowkick", name:"Low kick chirurgical", discipline:"boxe", tier:1, desc:"Ronge la mobilité de l'adversaire round après round." },
  { id:"feintejambe", name:"Feinte de jambe", discipline:"boxe", tier:2, desc:"Ouvre des angles de frappe en trompant l'appui." },
  { id:"combocliché", name:"Combo poing-genou en clinch", discipline:"boxe", tier:2, desc:"Enchaînement dévastateur au corps à corps." },
  { id:"contrerecul", name:"Contre en recul", discipline:"boxe", tier:2, desc:"Punit l'avancée adverse d'une frappe précise." },
  { id:"uppercut", name:"Uppercut ravageur", discipline:"boxe", tier:2, desc:"Frappe verticale letale en contre-attaque." },
  { id:"supermanpunch", name:"Superman punch", discipline:"boxe", tier:3, desc:"Frappe sautée spectaculaire et puissante." },
  { id:"genousaute", name:"Genou sauté", discipline:"boxe", tier:3, desc:"Frappe aérienne qui surprend en clinch." },
  { id:"gnp", name:"Ground and pound chirurgical", discipline:"boxe", tier:3, desc:"Frappes précises et dévastatrices au sol." },
  { id:"highkick", name:"High kick spectaculaire", discipline:"boxe", tier:3, desc:"Coup de pied haut, souvent décisif." },
  { id:"elbowspin", name:"Elbow spinning", discipline:"boxe", tier:4, desc:"Coude retourné, redoutable en un instant." },
  { id:"headkickcalc", name:"Head kick calculé", discipline:"boxe", tier:4, desc:"Setup patient menant à un KO à la tête." },
  { id:"combo123", name:"Enchaînement 1-2-3 dévastateur", discipline:"boxe", tier:5, desc:"Séquence signature capable de finir n'importe qui." },

  // Grappling / soumissions (15)
  { id:"passebutterfly", name:"Passage de garde papillon", discipline:"grappling", tier:1, desc:"Neutralise la garde adverse efficacement." },
  { id:"balayage", name:"Balayage de garde", discipline:"grappling", tier:1, desc:"Renverse la position depuis le dos." },
  { id:"armbardepuisgarde", name:"Armbar depuis la garde", discipline:"grappling", tier:2, desc:"Clé de bras classique mais redoutable." },
  { id:"kimura", name:"Kimura verrouillée", discipline:"grappling", tier:2, desc:"Clé d'épaule qui plie l'adversaire." },
  { id:"guillotinedebout", name:"Guillotine debout", discipline:"grappling", tier:2, desc:"Étranglement surprise sur un takedown adverse." },
  { id:"escapeguillotine", name:"Escape de guillotine", discipline:"grappling", tier:2, desc:"Sortie technique d'une position dangereuse." },
  { id:"triangle", name:"Triangle éclair", discipline:"grappling", tier:2, desc:"Étranglement aux jambes redoutablement rapide." },
  { id:"omoplata", name:"Omoplata technique", discipline:"grappling", tier:3, desc:"Clé d'épaule complexe depuis la garde." },
  { id:"rnc", name:"Rear naked choke", discipline:"grappling", tier:3, desc:"Étranglement arrière, souvent fatal." },
  { id:"dosceinture", name:"Contrôle dos ceinturé", discipline:"grappling", tier:3, desc:"Domination totale depuis le dos." },
  { id:"darce", name:"D'Arce choke", discipline:"grappling", tier:3, desc:"Étranglement latéral technique et rapide." },
  { id:"heelhook", name:"Heel hook", discipline:"grappling", tier:4, desc:"Clé de jambe redoutée du circuit." },
  { id:"calfslicer", name:"Calf slicer", discipline:"grappling", tier:4, desc:"Attaque douloureuse du mollet." },
  { id:"northsouth", name:"North-South choke", discipline:"grappling", tier:4, desc:"Étranglement rare depuis une position dominante." },
  { id:"berimbolo", name:"Berimbolo", discipline:"grappling", tier:5, desc:"Enchaînement acrobatique de haut niveau." },

  // Lutte (12)
  { id:"doubleleg", name:"Double leg explosif", discipline:"lutte", tier:1, desc:"Projection au sol franche et rapide." },
  { id:"singleleg", name:"Single leg chaîné", discipline:"lutte", tier:1, desc:"Attaque de jambe suivie d'enchaînements." },
  { id:"sprawl", name:"Sprawl défensif", discipline:"lutte", tier:1, desc:"Défense de takedown quasi automatique." },
  { id:"snapdown", name:"Snapdown", discipline:"lutte", tier:1, desc:"Casse la posture adverse en un geste." },
  { id:"ceinturegenou", name:"Ceinture-genou", discipline:"lutte", tier:2, desc:"Contrôle et projection depuis le clinch." },
  { id:"anklepick", name:"Ankle pick", discipline:"lutte", tier:2, desc:"Projection rapide sur une cheville dégagée." },
  { id:"blastdouble", name:"Blast double", discipline:"lutte", tier:2, desc:"Double jambe puissant et pénétrant." },
  { id:"controlemur", name:"Contrôle au mur", discipline:"lutte", tier:2, desc:"Impose son rythme en collant l'adversaire à la cage." },
  { id:"suplex", name:"Suplex spectaculaire", discipline:"lutte", tier:3, desc:"Projection arrière impressionnante." },
  { id:"reprisededos", name:"Reprise de dos", discipline:"lutte", tier:3, desc:"Retour dans le dos après une tentative adverse." },
  { id:"groundcontrol", name:"Ground control écrasant", discipline:"lutte", tier:3, desc:"Immobilisation totale au sol." },
  { id:"prisededoscage", name:"Prise de dos en cage", discipline:"lutte", tier:4, desc:"Contrôle dorsal exploitant la clôture." },

  // Général / mental / cardio (8)
  { id:"gestioncardio", name:"Gestion du cardio en championship rounds", discipline:"general", tier:3, desc:"Optimise l'effort sur cinq rounds." },
  { id:"feintemental", name:"Feintes mentales pré-combat", discipline:"general", tier:2, desc:"Déstabilise l'adversaire avant la cloche." },
  { id:"recupacceleree", name:"Récupération accélérée entre rounds", discipline:"general", tier:2, desc:"Repart plus frais au round suivant." },
  { id:"lecturegameplan", name:"Lecture du gameplan adverse", discipline:"general", tier:3, desc:"Anticipe les intentions de l'adversaire." },
  { id:"sangfroid", name:"Sang-froid en situation de crise", discipline:"general", tier:4, desc:"Reste lucide sous la pression extrême." },
  { id:"instinctfinisseur", name:"Instinct de finisseur", discipline:"general", tier:4, desc:"Sait reconnaître et exploiter le bon moment." },
  { id:"ambidextre", name:"Frappe ambidextre", discipline:"general", tier:5, desc:"Frappe aussi fort des deux côtés, imprévisible." },
  { id:"adaptationdirecte", name:"Adaptation de style en direct", discipline:"general", tier:5, desc:"Change de plan de jeu en plein combat." },
];

function rand(a,b){ return a + Math.random()*(b-a); }
function randInt(a,b){ return Math.floor(rand(a,b+1)); }
function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
function eur(n){ return Math.round(n).toLocaleString("fr-FR") + " €"; }
// ---- Impôts : le fisc prélève sa part sur chaque bourse, de façon progressive — un champion peut
// gagner énormément mais en reverse une bonne partie dès qu'il change de tranche. ----
function computeTax(purse){
  if (purse <= 3000) return Math.round(purse*0.10);
  if (purse <= 12000) return Math.round(purse*0.20);
  if (purse <= 40000) return Math.round(purse*0.30);
  if (purse <= 150000) return Math.round(purse*0.38);
  return Math.round(purse*0.45);
}
function overallSkill(s){ return (s.boxe + s.grappling + s.lutte) / 3; }
function styleFocusDiscipline(s){
  if (s.styleId==="boxeur") return "boxe";
  if (s.styleId==="lutteur") return "lutte";
  if (s.styleId==="grappler") return "grappling";
  return null;
}

// ---- Système de niveaux par discipline (dérivé des stats continues 0-99) ----
// Paliers non-linéaires et de plus en plus exigeants : les premiers niveaux tombent vite,
// les derniers demandent un travail acharné (l'écart entre Vétéran et Légendaire est énorme).
const LEVEL_NAMES = ["Débutant","Novice","Amateur","Confirmé","Sérieux","Aguerri","Expert","Élite","Vétéran","Légendaire"];
const LEVEL_THRESHOLDS = [0, 12, 24, 36, 48, 60, 71, 81, 89, 95]; // valeur mini pour atteindre le niveau i+1
const LEVELED_STATS = [
  { key:"boxe", label:"Boxe / Frappe" },
  { key:"grappling", label:"Grappling" },
  { key:"lutte", label:"Lutte" },
  { key:"cardio", label:"Cardio" },
  { key:"mental", label:"Mental" },
  { key:"chin", label:"Menton" },
];
function disciplineLevel(v){
  const val = v||0;
  let lvl = 1;
  for (let i=LEVEL_THRESHOLDS.length-1;i>=0;i--){
    if (val >= LEVEL_THRESHOLDS[i]){ lvl = i+1; break; }
  }
  return clamp(lvl, 1, 10);
}
function nextLevelThreshold(v){
  const lvl = disciplineLevel(v);
  return lvl>=10 ? null : LEVEL_THRESHOLDS[lvl];
}
function levelName(lvl){ return LEVEL_NAMES[clamp(lvl,1,10)-1]; }
function computeLevels(s){
  const out = {};
  LEVELED_STATS.forEach(({key})=>{ out[key] = disciplineLevel(s[key]); });
  return out;
}
function detectLevelUps(prevLevels, newLevels){
  const changes = [];
  LEVELED_STATS.forEach(({key,label})=>{
    if (newLevels[key] !== prevLevels[key]){
      changes.push({
        key, label, from: prevLevels[key], to: newLevels[key],
        levelName: levelName(newLevels[key]),
        dir: newLevels[key] > prevLevels[key] ? "up" : "down",
      });
    }
  });
  return changes;
}

// ---- Points de technique : gagnés sur victoires / montées de niveau, dépensés pour apprendre ----
// une technique de son choix parmi celles éligibles (plutôt qu'un déblocage aléatoire).
// Le coût en points correspond au tier de la technique (1 à 5), rendant les techniques avancées
// bien plus difficiles à obtenir qu'auparavant.
// Depuis la refonte : au-delà du niveau minimum requis, les techniques tier 3 exigent un coach
// spécialisé adapté à la discipline dans le staff, et les tier 4-5 exigent EN PLUS d'être parti
// en stage à l'étranger (TRAINING_CAMPS) dans cette discipline au moins une fois.
function techniqueCost(t){ return t.tier; }
const TECH_DISCIPLINE_COACH = { boxe:"coach_muaythai", grappling:"coach_bjj_bresilien", lutte:"coach_lutte_russe", general:"maitre_mental_japonais" };
const TECH_DISCIPLINE_CAMP = { boxe:"thailand_muaythai", grappling:"brazil_bjj", lutte:"russia_lutte", general:"japan_mental" };
function techniqueSkillMet(t, s){
  const skillVal = t.discipline==="general" ? overallSkill(s) : (s[t.discipline]!==undefined ? s[t.discipline] : overallSkill(s));
  return skillVal >= t.tier*12;
}
function techniqueRequirementMet(t, s){
  if (!techniqueSkillMet(t, s)) return false;
  if (t.tier <= 2) return true;
  const coachId = TECH_DISCIPLINE_COACH[t.discipline] || TECH_DISCIPLINE_COACH.general;
  const hasCoach = (s.hiredStaff||[]).includes(coachId) || (s.hiredStaff||[]).includes("analyste_video");
  if (t.tier === 3) return hasCoach;
  const campId = TECH_DISCIPLINE_CAMP[t.discipline] || TECH_DISCIPLINE_CAMP.general;
  const hasCamp = (s.campsDone||[]).includes(campId);
  return hasCoach && hasCamp;
}
function techniqueLockReason(t, s){
  if (!techniqueSkillMet(t, s)) return "Niveau de discipline insuffisant";
  if (t.tier >= 3){
    const coachId = TECH_DISCIPLINE_COACH[t.discipline] || TECH_DISCIPLINE_COACH.general;
    const hasCoach = (s.hiredStaff||[]).includes(coachId) || (s.hiredStaff||[]).includes("analyste_video");
    if (!hasCoach) return "Nécessite un coach spécialisé adapté dans ton staff";
  }
  if (t.tier >= 4){
    const campId = TECH_DISCIPLINE_CAMP[t.discipline] || TECH_DISCIPLINE_CAMP.general;
    const hasCamp = (s.campsDone||[]).includes(campId);
    if (!hasCamp) return "Nécessite un stage à l'étranger dans cette discipline";
  }
  return null;
}
function eligibleTechniquesToLearn(s){
  return TECHNIQUES.filter(t=>{
    if (s.discoveredTechniques.includes(t.id)) return false;
    return techniqueRequirementMet(t, s);
  });
}

// ---- Méthode de fin de combat : KO / TKO / Soumission / Décision ----
// Cohérence : en cas de victoire, la méthode dépend de TA tactique (donc de ton style d'attaque).
// En cas de défaite, elle dépend du STYLE de l'adversaire (un lutteur te contrôle et t'étouffe,
// un grappler te soumet, un boxeur te met KO) : la défaite raconte une histoire logique.
function weightsForFocus(focus){
  if (focus === "boxe") return { ko:0.30, tko:0.24, soumission:0.05, decision:0.41 };
  if (focus === "lutte") return { ko:0.07, tko:0.22, soumission:0.16, decision:0.55 };
  if (focus === "grappling") return { ko:0.05, tko:0.10, soumission:0.45, decision:0.40 };
  return { ko:0.05, tko:0.08, soumission:0.07, decision:0.80 };
}
function weightsForOpponentStyle(oppStyleId){
  if (oppStyleId === "boxeur") return { ko:0.34, tko:0.26, soumission:0.03, decision:0.37 };
  if (oppStyleId === "lutteur") return { ko:0.05, tko:0.28, soumission:0.14, decision:0.53 };
  if (oppStyleId === "grappler") return { ko:0.04, tko:0.09, soumission:0.48, decision:0.39 };
  return { ko:0.10, tko:0.15, soumission:0.15, decision:0.60 };
}
// (La détermination de la méthode de victoire/défaite se fait désormais round par round,
// voir tryEarlyFinish et pickDecisionMethod ci-dessous.)
// ---- Fin de combat anticipée, décidée round par round ----
// Après chaque round joué, on vérifie si le combat se termine tout de suite (KO / TKO / soumission),
// plutôt que de toujours forcer tous les rounds prévus jusqu'au bout — un round 1 ou 2 réussi
// (ou raté) peut donc bel et bien clore le combat immédiatement, comme dans un vrai combat de MMA.
function tryEarlyFinish(opt, tactic, s){
  const staffWinBonus = staffEffect(s.hiredStaff, "winChanceBonus");
  const winDeltaTactic = tacticWinDelta(tactic, s);
  const styleEdge = styleMatchupEdge(opt.oppStyleId, tactic.focus);
  const styleEdgeDelta = styleEdge * -9;
  const winChance = clamp(opt.winChance + winDeltaTactic + styleEdgeDelta + (opt.momentDelta||0) + (opt.trashWinDelta||0) + (opt.techniqueWinDelta||0) + staffWinBonus + oppAdaptWinDelta(opt.oppAdapt) + fightInjuriesSuccessAdj(opt.fightInjuries, tactic.focus) + (opt.crowdWinAdj||0) - fatiguePenalty(s) - mentalFatiguePenalty(s), 3, 95);
  const extremity = Math.abs(winChance-50)/50; // 0 (combat très serré) à 1 (issue quasi certaine)
  let finishChance = 0.15 + extremity*0.22 + (opt.riskyFinishBoost?0.18:0) + (opt.riskyFailure?0.12:0) + (opt.roundIndex-1)*0.05 + oppAdaptFinishChanceDelta(opt.oppAdapt);
  // ---- Personnalité de l'adversaire : influence QUAND le combat se termine, pas seulement comment ----
  const traits = opt.oppTraits||[];
  if (opt.roundIndex >= 3){
    if (traits.includes("faibleCardio")) finishChance += 0.10; // il craque en fin de combat
    if (traits.includes("grosCardio")) finishChance -= 0.06; // il tient la distance
  }
  if (traits.includes("finisseur")) finishChance += 0.05;
  if (traits.includes("patient") && opt.roundIndex <= 2) finishChance -= 0.07; // ne se précipite jamais tôt
  if (winChance >= 50){
    if (traits.includes("bonDefenseur")) finishChance -= 0.06; // dur à finir malgré ton avantage
    if (traits.includes("mauvaisDefenseur")) finishChance += 0.08; // s'écroule vite sous la pression
  } else if (traits.includes("peureux")){
    finishChance += 0.05; // craque psychologiquement quand il est mené
  }
  finishChance = clamp(finishChance, 0.06, 0.70);
  if (Math.random() > finishChance) return null; // le combat continue au round suivant
  const win = Math.random()*100 < winChance;
  let weights = win ? weightsForFocus(tactic.focus) : weightsForOpponentStyle(opt.oppStyleId);
  if (win && opt.riskyFinishBoost) weights = { ko: weights.ko*2, tko: weights.tko*1.6, soumission: weights.soumission*1.4 };
  if (!win){
    // Un bon menton réduit nettement le risque de KO en cas de défaite, sans effacer le risque de soumission/TKO.
    const chinReduce = clamp(1 - ((s.chin||0)-50)*0.007, 0.55, 1.35);
    weights = { ...weights, ko: weights.ko * chinReduce };
  }
  const finishWeights = { ko: weights.ko, tko: weights.tko, soumission: weights.soumission };
  const sum = Object.values(finishWeights).reduce((a,b)=>a+b,0);
  if (sum <= 0) return null;
  const roll = Math.random()*sum;
  let acc = 0, chosen = "tko";
  for (const k of Object.keys(finishWeights)){ acc += finishWeights[k]; if (roll <= acc){ chosen = k; break; } }
  return { win, method: { code: chosen, round: opt.roundIndex, decisionType: null, maxRound: opt.maxRoundPlanned } };
}
// ---- Décision forcée si le combat va au bout des rounds prévus sans finish : trois juges
// indépendants notent CHAQUE round réellement disputé (et non plus un simple tirage au sort
// déconnecté du combat), d'où de vraies décisions unanimes, partagées, majoritaires ou nulles. ----
function pickDecisionMethod(opt){
  const hist = opt.roundHistory && opt.roundHistory.length ? opt.roundHistory : null;
  const judges = opt.judges || pickJudgesPanel();
  if (!hist){
    // Filet de sécurité si aucun historique de round n'est disponible (ex. ancien combat en cours).
    const r = Math.random();
    const decisionType = r < 0.55 ? "unanime" : r < 0.85 ? "partagée" : "majoritaire";
    return { code:"decision", round: opt.maxRoundPlanned, decisionType, maxRound: opt.maxRoundPlanned, scorecards: null, decisionWin: null };
  }
  const scorecards = judges.map(j => {
    const rounds = hist.map(h => scoreRoundForJudge(h.delta, j));
    const totals = rounds.reduce((a,r2)=>[a[0]+r2[0], a[1]+r2[1]], [0,0]);
    return { judge: j.name, rounds, totals, forPlayer: totals[0]>totals[1] ? true : totals[0]<totals[1] ? false : null };
  });
  const playerCards = scorecards.filter(c=>c.forPlayer===true).length;
  const oppCards = scorecards.filter(c=>c.forPlayer===false).length;
  const drawCards = scorecards.filter(c=>c.forPlayer===null).length;
  let decisionType, decisionWin;
  if (playerCards===3 || oppCards===3){ decisionType = "unanime"; decisionWin = playerCards===3; }
  else if (drawCards===3){ decisionType = "nulle unanime"; decisionWin = null; }
  else if (drawCards===2){ decisionType = "nulle majoritaire"; decisionWin = null; }
  else if ((playerCards===2 && drawCards===1) || (oppCards===2 && drawCards===1)){ decisionType = "majoritaire"; decisionWin = playerCards===2; }
  else if (playerCards===1 && oppCards===1 && drawCards===1){ decisionType = "partagée"; decisionWin = null; } // combat très contesté, tranché à la marge (voir plus bas)
  else { decisionType = "partagée"; decisionWin = playerCards>oppCards; }
  if (decisionWin===null && decisionType==="partagée") decisionWin = (scorecards.reduce((a,c)=>a+(c.totals[0]-c.totals[1]),0)) >= 0;
  return { code:"decision", round: opt.maxRoundPlanned, decisionType, maxRound: opt.maxRoundPlanned, scorecards, decisionWin };
}
// ---- Sévérité d'un KO/TKO subi, et semaines de convalescence associées ----
// Décision : 1-2 semaines · TKO : 3-5 · KO léger : 6-8 · KO violent : 3-6 mois (interdiction médicale)
// Soumission : 2-4 (ligament/articulation) · Blessure grave (indépendante) : jusqu'à 1 an.
function computeRecoveryWeeks(method, win, severeInjury){
  if (severeInjury) return { weeks: randInt(30,52), tag:"Blessure grave", medicalBan:true, severe:true };
  if (method.code==="arret_medecin") return { weeks: randInt(4,9), tag:"Arrêt médical", medicalBan: Math.random()<0.3 };
  if (method.code==="dq") return { weeks: randInt(1,3), tag:"Disqualification" };
  if (win){
    if (method.code==="ko") return { weeks: randInt(1,3), tag:"Fatigue post-combat" };
    if (method.code==="tko" || method.code==="arret_coin") return { weeks: randInt(1,2), tag:"Fatigue post-combat" };
    return { weeks: randInt(1,1), tag:"Fatigue post-combat" };
  }
  if (method.code==="decision") return { weeks: randInt(1,2), tag:"Décision" };
  if (method.code==="tko" || method.code==="arret_coin") return { weeks: randInt(3,5), tag:"TKO" };
  if (method.code==="soumission") return { weeks: randInt(2,4), tag:"Soumission (articulation)" };
  if (method.code==="ko"){
    const violent = Math.random() < 0.4;
    return violent
      ? { weeks: randInt(13,26), tag:"KO violent", medicalBan:true }
      : { weeks: randInt(6,8), tag:"KO léger" };
  }
  return { weeks: 1, tag:"" };
}
function methodLabel(m){
  if (!m) return "Décision";
  if (m.code === "ko") return `KO au round ${m.round}`;
  if (m.code === "tko") return `Arrêt de l'arbitre (TKO) au round ${m.round}`;
  if (m.code === "soumission") return `Soumission au round ${m.round}`;
  if (m.code === "arret_medecin") return `Arrêt du médecin au round ${m.round}`;
  if (m.code === "arret_coin") return `Le coin jette l'éponge (round ${m.round})`;
  if (m.code === "dq") return `Disqualification au round ${m.round}`;
  if (m.code === "no_contest") return `No Contest (round ${m.round})`;
  if (m.decisionType && m.decisionType.startsWith("nulle")) return `Match nul — décision ${m.decisionType} (${m.round} rounds)`;
  return `Décision ${m.decisionType} (${m.round} rounds)`;
}

// small helper for a snappy, bouncy press feedback on every clickable element
const BTN = "btn-bounce transition-transform";
// ---- Organisation du menu principal en onglets, pour regrouper les actions par thème plutôt
// que d'aligner un long ruban de boutons peu lisible. ----
const MENU_TABS = [
  { id:"combats", icon:"🥊", label:"Combats", activeClass:"text-sky-400 border-sky-500" },
  { id:"entrainement", icon:"🏋️", label:"Entraînement", activeClass:"text-emerald-400 border-emerald-500" },
  { id:"equipe", icon:"🧑‍🤝‍🧑", label:"Équipe", activeClass:"text-amber-400 border-amber-500" },
  { id:"communication", icon:"📱", label:"Communication", activeClass:"text-fuchsia-400 border-fuchsia-500" },
  { id:"finances", icon:"💰", label:"Finances", activeClass:"text-lime-400 border-lime-500" },
  { id:"objectifs", icon:"🎯", label:"Objectifs", activeClass:"text-yellow-400 border-yellow-500" },
];

// ---- Records du circuit à battre : des repères fictifs, mais volontairement ambitieux, qui
// donnent un cap à long terme en plus des ceintures. Chaque record se "casse" une seule fois
// (voir state.recordsBroken) et déclenche une ligne de log + une petite récompense. ----
const RECORDS = [
  { id:"record_streak", icon:"🔥", label:"Plus longue série de victoires consécutives", holder:"Le record historique du circuit", target:16,
    value:(s)=> s.longestWinStreak||0, unit:"victoire(s)" },
  { id:"record_defenses", icon:"🛡️", label:"Défenses de titre consécutives", holder:"Le record historique du circuit", target:9,
    value:(s)=> s.titleDefenses||0, unit:"défense(s)" },
  { id:"record_finitions", icon:"💥", label:"Victoires par finition en carrière (KO/TKO/soumission)", holder:"Le record historique du circuit", target:30,
    value:(s)=> (s.koWins||0)+(s.tkoWins||0)+(s.subWins||0), unit:"finition(s)" },
  { id:"record_legendes", icon:"👑", label:"Victoires face à des légendes du sport", holder:"Le record historique du circuit", target:5,
    value:(s)=> s.legendWins||0, unit:"victoire(s)" },
  { id:"record_fotys", icon:"⭐", label:"Combats de l'année remportés", holder:"Le record historique du circuit", target:6,
    value:(s)=> s.fightsOfTheYear||0, unit:"combat(s)" },
  { id:"record_orgs", icon:"🌍", label:"Organisations différentes conquises en carrière", holder:"Le record historique du circuit", target:4,
    value:(s)=> new Set(s.titlesWonOrgs||[]).size, unit:"organisation(s)" },
  { id:"record_bourse", icon:"💰", label:"Plus grosse bourse empochée pour un seul combat", holder:"Le record historique du circuit", target:3000000,
    value:(s)=> s.biggestPurse||0, unit:"€", isMoney:true },
];

// ---- Grands objectifs de carrière : des jalons rares qui définissent une légende, en plus des
// records ci-dessus. "GOAT" et "invaincu" se lisent surtout au fil de la carrière / à la retraite,
// les deux autres peuvent se déclencher activement en cours de route. ----
const OBJECTIVES = [
  { id:"obj_ceintures_multiples", icon:"🥇🥇", label:"Ceintures simultanées dans plusieurs catégories",
    desc:"Détenir, au même moment, une ceinture dans au moins 2 organisations différentes.",
    check:(s)=> (s.titleHolderOrgs||[]).length >= 2,
    progress:(s)=> `${(s.titleHolderOrgs||[]).length}/2 ceinture(s) détenue(s) simultanément` },
  { id:"obj_grand_chelem", icon:"🌐", label:"Grand Chelem",
    desc:"Devenir champion dans au moins 3 organisations différentes au cours de ta carrière.",
    check:(s)=> new Set(s.titlesWonOrgs||[]).size >= 3,
    progress:(s)=> `${new Set(s.titlesWonOrgs||[]).size}/3 organisation(s) conquise(s)` },
  { id:"obj_goat", icon:"🐐", label:"Devenir le GOAT",
    desc:"Atteindre le statut ultime de Greatest Of All Time, à force de titres, de défenses et de séries de victoires.",
    check:(s)=> computeLegacyScoreStatic(s).legacy100 >= 85,
    progress:(s)=> `Indice de légende : ${computeLegacyScoreStatic(s).legacy100}/85` },
  { id:"obj_invaincu", icon:"💯", label:"Finir invaincu",
    desc:"Prendre ta retraite sans avoir jamais connu la défaite.",
    check:(s)=> !!s.careerOver && (s.losses||0) === 0 && (s.wins||0) > 0,
    progress:(s)=> s.losses>0 ? `Objectif manqué : ${s.losses} défaite(s) au compteur` : `${s.wins||0} victoire(s), 0 défaite pour l'instant` },
];

// Version autonome (hors composant) du calcul de legacy, utilisée par l'objectif GOAT pour ne
// pas dépendre d'une fonction interne au composant React.
function computeLegacyScoreStatic(s){
  const titles = s.titles||0;
  const defenses = s.titleDefenses||0;
  const legendWins = s.legendWins||0;
  const streak = s.longestWinStreak||0;
  const finishes = (s.koWins||0)+(s.tkoWins||0)+(s.subWins||0);
  const orgsCount = new Set(s.titlesWonOrgs||[]).size;
  const raw = titles*11 + defenses*5 + legendWins*7 + Math.min(streak,15)*2 + Math.min(finishes,40)*1.1 + Math.min(orgsCount,6)*4;
  const legacy100 = Math.round(clamp(raw, 0, 100));
  return { legacy100 };
}

// injected once: a springy "rebond" keyframe used by every button/clickable on press, plus
// the level-up pop/glow and toast animations used after fights, repos and stages
const BOUNCE_STYLE = `
@keyframes btnBounceKF {
  0%   { transform: scale(1); }
  35%  { transform: scale(0.90); }
  65%  { transform: scale(1.06); }
  100% { transform: scale(1); }
}
.btn-bounce { transform-origin: center; }
.btn-bounce:active { animation: btnBounceKF 0.38s cubic-bezier(.34,1.56,.64,1); }

@keyframes levelUpPopKF {
  0%   { transform: scale(0.4) rotate(-6deg); opacity: 0; }
  55%  { transform: scale(1.12) rotate(2deg); opacity: 1; }
  75%  { transform: scale(0.96) rotate(-1deg); }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}
.level-up-pop { animation: levelUpPopKF 0.55s cubic-bezier(.34,1.56,.64,1); }

@keyframes levelUpGlowKF {
  0%, 100% { box-shadow: 0 0 0 rgba(250,204,21,0); }
  50%      { box-shadow: 0 0 22px rgba(250,204,21,0.55); }
}
.level-up-glow { animation: levelUpGlowKF 1.4s ease-in-out infinite; }

@keyframes toastSlideKF {
  0%   { transform: translateY(-14px) scale(0.9); opacity: 0; }
  12%  { transform: translateY(0) scale(1); opacity: 1; }
  85%  { transform: translateY(0) scale(1); opacity: 1; }
  100% { transform: translateY(-10px) scale(0.95); opacity: 0; }
}
.toast-anim { animation: toastSlideKF 3.2s ease-in-out forwards; }
`;

function availableOrgs(rep, age){
  return ORGS.filter(o => age >= o.minAge && rep >= o.repReq);
}

function winLabel(pct){
  if (pct >= 72) return { txt: "Grand favori", color: "text-emerald-400" };
  if (pct >= 58) return { txt: "Favori", color: "text-emerald-300" };
  if (pct >= 44) return { txt: "Combat équilibré", color: "text-yellow-400" };
  if (pct >= 30) return { txt: "Outsider", color: "text-orange-400" };
  return { txt: "Mission quasi impossible", color: "text-red-500" };
}

function contractChance(org, s){
  return clamp(35 + (s.reputation - org.repReq) * 1.2 + ((s.aura||0)-50)*0.15 + (s.hasAgent?8:0), 8, 95);
}
// ---- Négociation de contrat : jusqu'à 2 tentatives, chacune avec une chance de succès et un
// risque (limité) que l'organisation retire son offre si l'ambiance était déjà tendue. ----
const CONTRACT_NEGOTIATION_OPTIONS = [
  { id:"plus_garanti", label:"💰 Plus de garanti, moins de prime de victoire", desc:"Tu sécurises un minimum garanti plus élevé, mais la prime de victoire baisse." },
  { id:"plus_combats", label:"📄 Contrat plus long", desc:"Tu demandes 2 combats de plus sur la durée, contre une prime à la signature réduite." },
  { id:"clause_titre", label:"🏆 Clause de titre garanti", desc:"Un combat pour le titre te sera garanti après 3 victoires sous contrat, contre une bourse globale un peu plus faible." },
];
function negotiationSuccessChance(org, s){
  return clamp(42 + (s.reputation - org.repReq) * 0.9 + (s.hasAgent?10:0) + ((s.aura||0)-50)*0.1, 15, 85);
}
function interestLabel(pct){
  if (pct >= 70) return { txt: "Très intéressés", color: "text-emerald-400" };
  if (pct >= 50) return { txt: "Ouverts à la discussion", color: "text-emerald-300" };
  if (pct >= 32) return { txt: "Hésitants", color: "text-yellow-400" };
  return { txt: "Peu convaincus", color: "text-orange-400" };
}
function buildContractOffer(org, s, renewal){
  const scale = renewal ? (1 + (s.contractWinRateLast||0) * 0.5) : 1;
  const fights = randInt(3,6);
  const bonus = org.payMult * 2600 * org.tier * rand(0.8,1.3) * scale;
  const perFightMin = org.payMult * 1400 * org.tier * scale;
  const winBonus = org.payMult * 900 * org.tier * rand(0.8,1.2);
  const titleBonus = org.payMult * 2200 * org.tier;
  return { org, fights, bonus, perFightMin, winBonus, titleBonus, renewal: !!renewal, negotiationsLeft: 2 };
}

// ---- Feud sur les réseaux sociaux : après certains combats, un autre combattant s'en prend
// publiquement à toi. Trois réponses possibles, chacune avec ses conséquences propres sur la
// controverse, le hype, et l'envie de l'organisation d'organiser un jour ce combat. ----
const FEUD_COMMENT_TEMPLATES = [
  "\"{player} n'a jamais affronté un vrai adversaire de mon niveau. Face à moi, ce serait plié en un round.\"",
  "\"Ce combat était limite truqué pour {player}, tout le monde le sait dans le milieu.\"",
  "\"{player} ferait mieux de prendre sa retraite avant de croiser ma route.\"",
  "\"J'attends toujours que {player} accepte enfin de m'affronter — à moins d'avoir peur.\"",
];
const FEUD_REPLIES = [
  { id:"classe", label:"😎 Ignorer avec classe", desc:"Tu ne mords pas à l'hameçon et laisses parler les résultats.",
    d:{ reputation:2, moral:1 }, controversy:-3, hypeGain:1, feudHeat:6 },
  { id:"repondre", label:"🎙️ Répondre calmement mais fermement", desc:"Tu recadres publiquement, sans t'enflammer.",
    d:{ aura:1 }, controversy:5, hypeGain:3, feudHeat:16 },
  { id:"attaquer", label:"🔥 Attaquer frontalement", desc:"Réponse cash, quitte à jeter de l'huile sur le feu.",
    d:{ moral:-2 }, controversy:15, hypeGain:6, feudHeat:30 },
];
function resolveFeudReply(replyId){
  return FEUD_REPLIES.find(x=>x.id===replyId);
}

// ---- Sponsor d'équipement sur le short de combat : un logo à arborer pendant tout le combat,
// avec une exigence précise (nombre minimum de rounds) pour toucher la prime. ----
const SHORT_SPONSOR_BRANDS = ["RageFuel Energy", "IronGrip Gear", "Apex Nutrition", "Vantage Fightwear", "Nordik Supplements", "BlackTide Apparel"];
function buildShortSponsorOffer(org, s){
  const brand = SHORT_SPONSOR_BRANDS[randInt(0, SHORT_SPONSOR_BRANDS.length-1)];
  const requiredRounds = Math.random() < 0.6 ? 2 : 3;
  const pay = Math.round((400 + org.tier*350) * (1 + (s.hype||20)*0.01) * rand(0.85,1.2) / 50) * 50;
  return { brand, requiredRounds, pay };
}

// ---------- LIFE EVENTS ("happenings") ----------
// Each choice.effect(s) returns {d:{...}, result:string}. Fields supported in d:
// money, skill, health, reputation, moral, coachRelation, cardio, mental, chin, aura, dette, hasAgent, agentCut
// Events can carry an optional cond(s) filter so some only appear in the right circumstances
// (agent-related, financial-crisis, etc).
//
// ---- Système de rareté ----
// Chaque événement porte un champ `rarity` (optionnel, "commun" par défaut pour compat avec les
// anciens événements). La rareté pondère le tirage : plus un événement est rare, plus ses
// conséquences (bonnes ou mauvaises) sont marquantes. Les poids ci-dessous reprennent l'esprit du
// barème "1 tirage sur X" tout en restant utilisables comme simples poids relatifs de tirage.
const RARITY_WEIGHTS = {
  tres_commun: 2500,
  commun: 1200,
  peu_commun: 500,
  rare: 100,
  epique: 25,
  legendaire: 5,
  mythique: 0.5,
  impossible: 0.05,
};
const RARITY_META = {
  tres_commun: { label: "Très commun", color: "text-zinc-400 border-zinc-700" },
  commun: { label: "Commun", color: "text-zinc-300 border-zinc-700" },
  peu_commun: { label: "Peu commun", color: "text-emerald-400 border-emerald-800" },
  rare: { label: "Rare", color: "text-sky-400 border-sky-800" },
  epique: { label: "Épique", color: "text-fuchsia-400 border-fuchsia-800" },
  legendaire: { label: "Légendaire", color: "text-amber-400 border-amber-700" },
  mythique: { label: "Mythique", color: "text-rose-400 border-rose-700" },
  impossible: { label: "Impossible", color: "text-red-500 border-red-700 animate-pulse" },
};
function eventRarity(e){ return e.rarity || "commun"; }
// Tirage pondéré par rareté au sein d'un pool déjà filtré par condition/anti-répétition.
function pickWeightedEvent(pool){
  if (!pool.length) return null;
  const weights = pool.map(e => RARITY_WEIGHTS[eventRarity(e)] || RARITY_WEIGHTS.commun);
  const total = weights.reduce((a,b)=>a+b, 0);
  let r = Math.random() * total;
  for (let i=0;i<pool.length;i++){
    r -= weights[i];
    if (r <= 0) return pool[i];
  }
  return pool[pool.length-1];
}

// ---- États persistants ----
// Un événement peut désormais laisser une trace durable via d.addPersistent (voir applyDelta) :
// { id, label, icon, type:"buff"|"debuff", effects:{...}, weeksLeft: number|null }
// weeksLeft:null = permanent jusqu'à suppression explicite (d.removePersistent).
// Champs d'effets reconnus : winChanceBonus (points de %), injuryRiskDelta (multiplicateur additif
// sur le risque de blessure), reputationBonus (bonus de réputation sur victoire), payMult
// (multiplicateur additif sur les bourses), hypeBonus (gain de hype passif par combat),
// moralWeekly (moral gagné/perdu chaque semaine).
function addPersistentState(ns, entry){
  const list = (ns.persistentStates||[]).filter(p=>p.id!==entry.id);
  ns.persistentStates = [...list, entry];
  return ns;
}
function removePersistentState(ns, id){
  ns.persistentStates = (ns.persistentStates||[]).filter(p=>p.id!==id);
  return ns;
}
function hasPersistentState(s, id){ return (s.persistentStates||[]).some(p=>p.id===id); }
function persistentSum(s, key){
  return (s.persistentStates||[]).reduce((tot,p)=> tot + ((p.effects&&p.effects[key])||0), 0);
}
function tickPersistentStates(ns, weeks){
  if (!ns.persistentStates || !ns.persistentStates.length) return ns;
  const kept = [];
  ns.persistentStates.forEach(p=>{
    if (p.weeksLeft == null){ kept.push(p); return; }
    const left = p.weeksLeft - weeks;
    if (left > 0) kept.push({ ...p, weeksLeft: left });
  });
  ns.persistentStates = kept;
  return ns;
}

const EVENTS = [
  { cat:"Médias", prompt:"L'organisation programme une séance de dédicaces avant l'événement — la file de fans s'étire dans tout le hall.",
    choices:[
      { label:"Prendre le temps avec chaque fan", effect:()=>({d:{moral:rand(4,9), hype:rand(2,5), health:-rand(1,3)}, result:"L'échange chaleureux avec le public marque les esprits, malgré la fatigue." }) },
      { label:"Rester bref pour économiser ton énergie avant le combat", effect:()=>({d:{moral:rand(0,2), hype:rand(0,1), health:rand(1,3)}, result:"Tu restes pro mais efficace, sans grand moment avec le public." }) },
    ]},
  { cat:"Médias", prompt:"Un groupe de fans fidèles t'attend à la sortie de la salle après une séance d'entraînement.",
    choices:[
      { label:"Poser pour des photos et signer des autographes", effect:()=>({d:{moral:rand(3,7), hype:rand(2,6)}, result:"Ces petits moments avec le public renforcent ta popularité." }) },
      { label:"Filer discrètement, épuisé par le camp", effect:()=>({d:{health:rand(1,3), hype:-rand(0,2)}, result:"Tu préserves ton énergie, au prix d'un peu de sympathie perdue." }) },
    ]},
  { cat:"Médias", prompt:"Un fan de longue date te retrouve enfin en personne lors d'un passage dans sa ville, très émue de te rencontrer.",
    choices:[
      { label:"Prendre un vrai moment avec cette personne", effect:()=>({d:{moral:rand(5,10), hype:rand(1,3)}, result:"Ce genre de rencontre te rappelle pourquoi tu te bats." }) },
      { label:"Rester poli mais pressé, agenda chargé", effect:()=>({d:{moral:rand(0,2)}, result:"Tu restes correct, mais le moment reste anecdotique." }) },
    ]},
  { cat:"Vie privée", prompt:"Ton/ta partenaire te reproche d'être toujours absent(e) à cause des stages en altitude.",
    choices:[
      { label:"Rester au camp, la carrière avant tout", effect:()=>({d:{moral:-6,skill:1.5}, result:"Tu restes concentré, mais la relation se fragilise." }) },
      { label:"Rentrer une semaine pour se retrouver", effect:()=>({d:{moral:8,skill:-1}, result:"Le couple respire, mais la préparation prend un peu de retard." }) },
    ]},
  { cat:"Vie privée", prompt:"Une marque de paris sportifs te propose un contrat de sponsoring juteux.",
    choices:[
      { label:"Signer, l'argent avant tout", effect:()=>({d:{money:rand(8000,18000), reputation:-2}, result:"Le chèque tombe, mais certains fans grincent des dents." }) },
      { label:"Refuser pour préserver ton image", effect:()=>({d:{reputation:3}, result:"Ton image reste nette, sans le bonus financier." }) },
    ]},
  { cat:"Vie privée", prompt:"Une rumeur non fondée enfle sur les réseaux sociaux à ton sujet.",
    choices:[
      { label:"Répondre publiquement", effect:()=>{ const win = Math.random()<0.5; return win? {d:{reputation:6}, result:"Ta réponse cash retourne l'opinion en ta faveur."} : {d:{reputation:-7,moral:-4}, result:"La polémique enfle encore plus après ta réponse."}; } },
      { label:"Ignorer et laisser retomber", effect:()=>({d:{moral:-2}, result:"Ça finit par retomber tout seul, sans bruit." }) },
    ]},
  { cat:"Vie privée", prompt:"Tu traverses un deuil difficile dans ta famille proche.",
    choices:[
      { label:"Prendre le temps de faire ton deuil", effect:()=>({d:{moral:-10, health:3}, result:"Tu t'accordes du répit, la tête ailleurs mais le corps préservé." }) },
      { label:"Te réfugier dans l'entraînement", effect:()=>({d:{moral:-15, skill:2}, result:"Tu fuis la douleur par le travail, au risque de t'épuiser mentalement." }) },
    ]},
  { cat:"Entraînement", prompt:"En sparring, tu découvres une nouvelle option technique prometteuse.",
    choices:[
      { label:"L'intégrer immédiatement à ton jeu", effect:()=>({d:{skill:4,health:-2}, result:"Tu progresses vite, au prix d'un sparring intense." }) },
      { label:"La travailler prudemment sur la durée", effect:()=>({d:{skill:2}, result:"Progression plus lente mais plus sûre." }) },
    ]},
  { cat:"Entraînement", prompt:"Un partenaire d'entraînement te blesse légèrement lors d'un sparring trop intense.",
    choices:[
      { label:"Continuer malgré la douleur", effect:()=>({d:{health:-10,skill:1}, result:"Tu serres les dents et poursuis le camp." }) },
      { label:"Lever le pied quelques jours", effect:()=>({d:{health:5,skill:-1}, result:"La prudence l'emporte, la blessure ne s'aggrave pas." }) },
    ]},
  { cat:"Entraînement", prompt:"Tu ressens des signes de fatigue chronique liés au rythme des camps.",
    choices:[
      { label:"Pousser plus fort quand même", effect:()=>({d:{skill:2,health:-12,moral:-4}, result:"Le surentraînement guette dangereusement." }) },
      { label:"Réduire le volume et écouter ton corps", effect:()=>({d:{health:8,skill:-1}, result:"Un choix payant pour la longévité de ta carrière." }) },
    ]},
  { cat:"Entraînement", prompt:"Un jeune prodige débarque dans ta salle et bouscule la hiérarchie à l'entraînement.",
    choices:[
      { label:"Accepter le défi et hausser ton niveau", effect:()=>({d:{skill:3, mental:3, health:-3}, result:"La rivalité stimulante te pousse vers le haut." }) },
      { label:"Garder tes distances", effect:()=>({d:{moral:-2}, result:"Tu préserves ton confort, sans réel progrès supplémentaire." }) },
    ]},
  { cat:"Coach", prompt:"Ton coach et toi êtes en désaccord total sur la stratégie du prochain combat.",
    choices:[
      { label:"Imposer ton plan de jeu", effect:()=>({d:{coachRelation:-8, moral:2}, result:"Tu prends le contrôle, mais la relation se tend." }) },
      { label:"Suivre les consignes du coach", effect:()=>({d:{coachRelation:6, skill:1}, result:"La confiance mutuelle se renforce." }) },
    ]},
  { cat:"Coach", prompt:"Ton coach réclame un pourcentage plus élevé sur tes bourses.",
    choices:[
      { label:"Accepter pour le garder motivé", effect:()=>({d:{coachRelation:8, money:-rand(1000,3000)}, result:"Il redouble d'implication pour ta préparation." }) },
      { label:"Refuser et négocier fermement", effect:()=>({d:{coachRelation:-10}, result:"Le climat devient froid entre vous deux." }) },
    ]},
  { cat:"Coach", prompt:"Une belle séance : ton coach te confie qu'il croit vraiment en ton potentiel de champion.",
    choices:[
      { label:"Savourer ce moment de complicité", effect:()=>({d:{coachRelation:10, moral:8}, result:"Cette confiance mutuelle te porte pour les prochains camps." }) },
    ]},
  { cat:"Coach", prompt:"Une organisation rivale tente de débaucher ton coach principal.",
    choices:[
      { label:"Le retenir avec une prime", effect:()=>({d:{money:-rand(2000,6000), coachRelation:8}, result:"Ton coach reste, rassuré par ton engagement financier." }) },
      { label:"Le laisser partir sans réagir", effect:()=>({d:{coachRelation:-15, skill:-1}, result:"Ton coach s'en va, un vide difficile à combler rapidement." }) },
    ]},
  { cat:"Rencontre", prompt:"Un ancien champion, croisé en salle, te donne un conseil précieux sur ta carrière.",
    choices:[
      { label:"Suivre son conseil à la lettre", effect:()=>({d:{skill:3, moral:4}, result:"Son expérience t'évite quelques erreurs de débutant." }) },
    ]},
  { cat:"Rencontre", prompt:"Un rival te provoque violemment sur les réseaux sociaux avant une possible confrontation.",
    choices:[
      { label:"Répondre du tac au tac", effect:()=>{ const buzz=Math.random()<0.6; return buzz?{d:{reputation:7,moral:-2},result:"Le clash fait le buzz, ta carte de visite grandit."}:{d:{reputation:-5},result:"L'échange tourne à ton désavantage médiatiquement."}; } },
      { label:"Ignorer superbement", effect:()=>({d:{moral:3}, result:"Tu gardes ton calme, loin du bruit médiatique." }) },
    ]},
  { cat:"Rencontre", prompt:"Un combattant reconnu te propose de rejoindre sa \"super-team\" internationale.",
    choices:[
      { label:"Rejoindre l'équipe", effect:()=>({d:{money:-rand(2000,5000), skill:4, coachRelation:-5}, result:"Le niveau d'entraînement grimpe, ton coach historique en prend ombrage." }) },
      { label:"Rester fidèle à ton équipe actuelle", effect:()=>({d:{coachRelation:5}, result:"Tu privilégies la stabilité de ton clan." }) },
    ]},
  { cat:"Carrière", prompt:"Un agent expérimenté te propose de gérer ta carrière moyennant commission.",
    cond:(s)=> !s.hasAgent && s.reputation>=12,
    choices:[
      { label:"Signer avec lui (commission 12%)", effect:()=>({d:{hasAgent:true, agentCut:0.12, reputation:2}, result:"Tu gagnes en professionnalisme, mais céderas une part de tes bourses désormais." }) },
      { label:"Rester indépendant", effect:()=>({d:{moral:2}, result:"Tu gères seul(e) ta carrière, pour le meilleur et pour le pire." }) },
    ]},
  { cat:"Finances", prompt:"Ton agent réclame une commission plus élevée, menaçant de te lâcher sinon.",
    cond:(s)=> s.hasAgent,
    choices:[
      { label:"Accepter (commission 18%)", effect:()=>({d:{agentCut:0.18, moral:-2}, result:"Tu cèdes pour garder son réseau et ses contacts." }) },
      { label:"Refuser fermement", effect:()=>{ const quit = Math.random()<0.4; return quit? {d:{hasAgent:false, agentCut:0}, result:"Ton agent claque la porte — retour à l'indépendance."} : {d:{moral:1}, result:"Il cède finalement et reste à tes côtés."}; } },
    ]},
  { cat:"Finances", prompt:"Le fisc t'informe d'un redressement fiscal sur tes derniers cachets.",
    cond:(s)=> s.money>15000,
    choices:[
      { label:"Payer immédiatement", effect:()=>({d:{money:-rand(6000,14000)}, result:"Douloureux pour la trésorerie, mais réglé proprement." }) },
      { label:"Étaler la dette dans le temps", effect:()=>({d:{dette:rand(6000,14000)}, result:"Tu gagnes du temps, au prix d'une dette qui s'accumule." }) },
    ]},
  { cat:"Finances", prompt:"Un ami d'enfance te propose d'investir dans un projet immobilier \"en or\".",
    choices:[
      { label:"Investir une grosse somme", effect:()=>{ const win=Math.random()<0.35; return win? {d:{money:rand(10000,30000)}, result:"Le pari est gagnant, l'investissement rapporte gros."} : {d:{money:-rand(8000,20000)}, result:"Le projet s'effondre, l'argent est perdu."}; } },
      { label:"Rester prudent et ne pas investir", effect:()=>({d:{}, result:"Tu préfères garder tes économies au chaud." }) },
    ]},
  { cat:"Finances", prompt:"Ta famille traverse une urgence financière et te demande de l'aide.",
    choices:[
      { label:"Envoyer une grosse somme", effect:()=>({d:{money:-rand(3000,9000), moral:6}, result:"Tu soulages ta famille, le cœur léger malgré la dépense." }) },
      { label:"Refuser, tu as tes propres charges", effect:()=>({d:{moral:-8}, result:"Le refus laisse un goût amer à la maison." }) },
    ]},
  { cat:"Finances", prompt:"Ton sponsor principal fait faillite du jour au lendemain, contrat rompu.",
    cond:(s)=> (s.aura||0)>=30,
    choices:[
      { label:"Chercher un remplaçant en urgence", effect:()=>{ const found=Math.random()<0.5; return found? {d:{money:rand(3000,8000)}, result:"Un nouveau sponsor comble le vide, avec un contrat plus modeste."} : {d:{moral:-4}, result:"Aucun remplaçant trouvé pour l'instant."}; } },
      { label:"Encaisser le coup sans réagir", effect:()=>({d:{moral:-3}, result:"Un manque à gagner que tu digères tant bien que mal." }) },
    ]},
  { cat:"Finances", prompt:"Un huissier te contacte au sujet de tes dettes accumulées.",
    cond:(s)=> (s.dette||0)>15000,
    choices:[
      { label:"Négocier un échéancier", effect:()=>({d:{moral:-3}, result:"Un plan de remboursement est mis en place, la pression redescend un peu." }) },
      { label:"Emprunter à un proche pour éponger", effect:()=>({d:{dette:-8000, coachRelation:-4}, result:"Un proche t'avance de l'argent, non sans tension." }) },
    ]},
  { cat:"Difficulté", prompt:"Un préparateur douteux te propose des produits pour accélérer ta récupération.",
    choices:[
      { label:"Refuser catégoriquement", effect:()=>({d:{moral:3}, result:"Tu restes propre, fidèle à tes valeurs." }) },
      { label:"Céder à la tentation", effect:()=>{ const caught=Math.random()<0.3; return caught? {d:{reputation:-25, moral:-15, money:-rand(5000,15000)}, result:"Contrôlé positif : suspension et scandale, ta carrière encaisse un coup terrible."} : {d:{health:8, energie:10}, result:"Tu récupères plus vite, personne n'a rien vu... pour l'instant."}; } },
    ]},
  { cat:"Difficulté", prompt:"Ton visa est refusé à la dernière minute avant un combat à l'étranger.",
    choices:[
      { label:"Se battre pour une solution d'urgence", effect:()=>{ const ok=Math.random()<0.5; return ok? {d:{money:-rand(1000,3000)}, result:"Une procédure accélérée coûteuse sauve ta participation."} : {d:{reputation:-4, moral:-5}, result:"Le combat t'échappe, contrat annulé."}; } },
      { label:"Accepter l'annulation", effect:()=>({d:{moral:-4}, result:"Tu encaisses la déception sans forcer les choses." }) },
    ]},
  { cat:"Difficulté", prompt:"Un média publie un article très critique sur ta carrière et ton comportement.",
    choices:[
      { label:"Répondre en conférence de presse", effect:()=>{ const win=Math.random()<0.5; return win? {d:{reputation:5, aura:4}, result:"Ta répartie retourne l'opinion publique en ta faveur."} : {d:{reputation:-6, moral:-3}, result:"La sortie médiatique se retourne contre toi."}; } },
      { label:"Ne pas réagir publiquement", effect:()=>({d:{moral:-2}, result:"Tu laisses l'article vivre sa vie, sans lui donner d'écho." }) },
    ]},
  { cat:"Difficulté", prompt:"Un contrôle antidopage inopiné perturbe ta préparation la veille d'un combat.",
    choices:[
      { label:"Rester concentré malgré le stress", effect:()=>({d:{mental:2, energie:-4}, result:"Tu gères la pression sans trembler." }) },
      { label:"Laisser le stress te gagner", effect:()=>({d:{moral:-5, energie:-8}, result:"Le stress grignote ton énergie avant le combat." }) },
    ]},
  { cat:"Rencontre", prompt:"Un nutritionniste sportif réputé assiste à l'un de tes entraînements et t'aborde après la séance.",
    cond:(s)=> !(s.discoveredStaff||[]).includes("nutritionniste"),
    choices:[
      { label:"Prendre ses coordonnées", effect:()=>({d:{discoverStaff:"nutritionniste"}, result:"Tu pourras désormais l'embaucher comme staff (voir l'onglet Staff)." }) },
      { label:"Ne pas donner suite", effect:()=>({d:{moral:1}, result:"Tu passes ton chemin, pour l'instant." }) },
    ]},
  { cat:"Rencontre", prompt:"Un analyste vidéo indépendant t'envoie un découpage impressionnant d'un de tes futurs adversaires.",
    cond:(s)=> !(s.discoveredStaff||[]).includes("analyste_video") && s.reputation>=10,
    choices:[
      { label:"Le recontacter", effect:()=>({d:{discoverStaff:"analyste_video"}, result:"Tu gardes son contact — il rejoint la liste du staff embauchable." }) },
      { label:"Ignorer le message", effect:()=>({d:{}, result:"Tu n'y donnes pas suite pour le moment." }) },
    ]},
  { cat:"Rencontre", prompt:"Un(e) attaché(e) de presse aguerri(e) te propose de gérer ta communication.",
    cond:(s)=> !(s.discoveredStaff||[]).includes("attache_presse") && s.reputation>=15,
    choices:[
      { label:"Étudier sa proposition", effect:()=>({d:{discoverStaff:"attache_presse"}, result:"Il/elle rejoint la liste du staff embauchable, moyennant salaire mensuel." }) },
      { label:"Décliner poliment", effect:()=>({d:{}, result:"Tu préfères gérer ta communication seul(e) pour l'instant." }) },
    ]},
  { cat:"Difficulté", prompt:"Une chute stupide dans les escaliers de ton immeuble te tord sérieusement la cheville.",
    choices:[
      { label:"Consulter immédiatement et suivre le protocole médical", effect:()=>({d:{injuredTurns:rand(3,5), health:-8}, result:"Le diagnostic est clair : quelques semaines d'arrêt sont indispensables." }) },
      { label:"Serrer les dents et continuer à t'entraîner dessus", effect:()=>({d:{injuredTurns:rand(6,10), health:-16, mental:-2}, result:"En forçant sur la blessure, tu l'aggraves nettement — l'arrêt sera bien plus long." }) },
    ]},
  { cat:"Difficulté", prompt:"Une bagarre éclate dans un bar alors que tu tentais juste de passer une soirée tranquille.",
    choices:[
      { label:"T'interposer pour calmer le jeu", effect:()=>{ const hurt=Math.random()<0.5; return hurt? {d:{injuredTurns:rand(2,4), health:-10, reputation:2}, result:"Tu écopes d'un coup perdu en t'interposant, mais les témoins saluent ton geste."} : {d:{reputation:3, aura:2}, result:"Tu désamorces la situation sans le moindre dégât — belle image publique."}; } },
      { label:"Partir discrètement", effect:()=>({d:{moral:1}, result:"Tu quittes les lieux avant que ça ne dégénère, sans encombre." }) },
    ]},
  { cat:"Carrière", prompt:"L'organisation avec laquelle tu es sous contrat traverse une grave crise financière interne.",
    cond:(s)=> !!s.contract,
    choices:[
      { label:"Rester loyal et attendre que ça passe", effect:()=>{ const collapse=Math.random()<0.35; return collapse? {d:{contractBreak:true, moral:-6, reputation:-3}, result:"L'organisation ne peut plus honorer les contrats — le tien est purement et simplement annulé."} : {d:{moral:2}, result:"La tempête passe, ton contrat tient bon."}; } },
      { label:"Activer une clause de sortie par précaution", effect:()=>({d:{contractBreak:true, money:rand(1000,4000)}, result:"Tu récupères une compensation et redeviens agent libre avant que ça n'empire." }) },
    ]},
  { cat:"Finances", prompt:"Une grande marque de vêtements de sport veut faire de toi son visage pour les deux prochaines saisons.",
    cond:(s)=> (s.hype||0)>=35,
    choices:[
      { label:"Signer l'accord long terme", effect:()=>({d:{sponsorWeekly:rand(180,420), sponsorWeeks:26, reputation:2}, result:"Un revenu confortable tombera chaque semaine pendant six mois — un vrai matelas financier." }) },
      { label:"Refuser pour rester libre de tes choix", effect:()=>({d:{moral:2, aura:1}, result:"Tu gardes une totale liberté d'image, sans le confort financier." }) },
    ]},
  { cat:"Difficulté", prompt:"Un accident de la route sur le trajet du gymnase te secoue sérieusement, sans gravité immédiate visible.",
    choices:[
      { label:"Passer des examens complets par précaution", effect:()=>{ const bad=Math.random()<0.4; return bad? {d:{injuredTurns:rand(4,8), health:-14}, result:"Les examens révèlent une lésion qu'il faut absolument laisser cicatriser."} : {d:{health:-4, moral:-2}, result:"Plus de peur que de mal, les examens sont rassurants."}; } },
      { label:"Reprendre l'entraînement dès le lendemain", effect:()=>({d:{injuredTurns:rand(5,12), health:-20, mental:-4}, result:"Une mauvaise idée : ton corps lâche quelques jours plus tard, l'arrêt est sévère." }) },
    ]},
  { cat:"Carrière", prompt:"Ta dernière performance impressionne un classement international influent.",
    cond:(s)=> s.wins>=3 && (s.reputation||0)>=25,
    choices:[
      { label:"Capitaliser en communiquant fort dessus", effect:()=>({d:{reputation:8, hype:10, aura:4}, result:"Ta cote grimpe nettement, les regards se tournent vers toi." }) },
      { label:"Rester discret et laisser parler les résultats", effect:()=>({d:{reputation:4, moral:2}, result:"Une progression plus feutrée, mais tout aussi réelle." }) },
    ]},

  { cat:"Coach", rarity:"rare", prompt:"Après des mois de résultats et de sérieux, ton coach t'annonce qu'il te fait désormais une confiance absolue, sans réserve.",
    cond:(s)=> (s.coachRelation||0)>=85 && (s.wins||0)>=5 && !hasPersistentState(s,"confiance_absolue_coach"),
    choices:[
      { label:"Accueillir cette confiance avec sérieux", effect:()=>({d:{moral:8,
          addPersistent:{ id:"confiance_absolue_coach", label:"Confiance absolue du coach", icon:"🤝", type:"buff", effects:{ winChanceBonus:2 }, weeksLeft: null } },
          result:"Cette relation de confiance totale se ressentira durablement dans ta préparation." }) },
    ]},
  { cat:"Carrière", rarity:"epique", prompt:"Ta série de victoires devient un vrai phénomène : les médias parlent déjà d'un règne qui s'annonce légendaire.",
    cond:(s)=> (s.winStreak||0)>=8 && !hasPersistentState(s,"serie_legendaire"),
    choices:[
      { label:"Assumer pleinement ce statut d'intouchable", effect:()=>({d:{hype:14, reputation:5, aura:5,
          addPersistent:{ id:"serie_legendaire", label:"Série de victoires légendaire", icon:"🐐", type:"buff", effects:{ winChanceBonus:3, hypeBonus:1 }, weeksLeft: null } },
          result:"Ton nom circule désormais dans toutes les discussions sur les plus grands du moment." }) },
      { label:"Rester humble malgré la série en cours", effect:()=>({d:{moral:4}, result:"Tu préfères ne pas t'enflammer, série en cours ou non." }) },
    ]},

  // ================= ENTRAÎNEMENT =================
  { cat:"Entraînement", rarity:"tres_commun", prompt:"Séance de sparring particulièrement propre : tout ce que tu tentes fonctionne aujourd'hui.",
    choices:[
      { label:"Enchaîner sur une deuxième séance", effect:()=>({d:{skill:2, energie:-6}, result:"Tu prolonges la séance tant que la sensation est bonne." }) },
      { label:"T'arrêter sur cette bonne note", effect:()=>({d:{skill:1, moral:2}, result:"Tu gardes cette impression positive pour le reste de la semaine." }) },
    ]},
  { cat:"Entraînement", rarity:"tres_commun", prompt:"Un sparring un peu trop engagé tourne à l'affrontement avec un partenaire.",
    choices:[
      { label:"Répondre coup pour coup", effect:()=>({d:{skill:1, health:-6, moral:-1}, result:"L'ego est sauf, le corps encaisse un peu." }) },
      { label:"Lever la main pour calmer le jeu", effect:()=>({d:{coachRelation:2}, result:"Ton coach apprécie ta maturité dans la gestion du sparring." }) },
    ]},
  { cat:"Entraînement", rarity:"commun", prompt:"Un nouveau partenaire d'entraînement rejoint ta salle, plus expérimenté que la moyenne.",
    choices:[
      { label:"Multiplier les rounds avec lui", effect:()=>({d:{skill:3, health:-3}, result:"Ce niveau de sparring te tire vers le haut." }) },
      { label:"Y aller progressivement", effect:()=>({d:{skill:1.5}, result:"Une intégration en douceur, sans prise de risque." }) },
    ]},
  { cat:"Entraînement", rarity:"peu_commun", prompt:"Ton coach t'annonce, visiblement sincère, qu'il n'a jamais vu quelqu'un progresser aussi vite.",
    choices:[
      { label:"Savourer ce compliment rare", effect:()=>({d:{moral:6, coachRelation:6}, result:"Ce vote de confiance te porte pour les semaines à venir." }) },
    ]},
  { cat:"Entraînement", rarity:"peu_commun", prompt:"Ton coach, déçu par ton relâchement récent, hausse le ton en pleine séance.",
    choices:[
      { label:"Encaisser et te remettre au travail", effect:()=>({d:{skill:2, moral:-3}, result:"La leçon est dure mais elle porte ses fruits." }) },
      { label:"Répondre sur le même ton", effect:()=>({d:{coachRelation:-8}, result:"Le clash laisse des traces dans la relation." }) },
    ]},
  { cat:"Entraînement", rarity:"peu_commun", prompt:"Une vidéo de ton entraînement, filmée par un partenaire, devient virale du jour au lendemain.",
    choices:[
      { label:"Surfer sur le buzz en commentant la vidéo", effect:()=>({d:{hype:8, reputation:2}, result:"Le buzz te fait connaître d'un public plus large." }) },
      { label:"Laisser la vidéo vivre sans réagir", effect:()=>({d:{hype:4}, result:"La vidéo circule sans que tu aies besoin d'en rajouter." }) },
    ]},
  { cat:"Entraînement", rarity:"peu_commun", prompt:"Après des mois de travail, un déclic technique soudain change ta façon de bouger.",
    choices:[
      { label:"Ancrer immédiatement ce nouveau réflexe", effect:()=>({d:{skill:5, techPoints:1}, result:"Ce déclic marque un vrai tournant dans ta progression." }) },
    ]},
  { cat:"Entraînement", rarity:"commun", prompt:"Le rythme des camps commence à user ton corps : les premiers signes de surentraînement apparaissent.",
    choices:[
      { label:"Pousser quand même, l'échéance approche", effect:()=>({d:{skill:2, health:-12, moral:-3}, result:"Tu joues avec le feu, le corps encaisse en silence." }) },
      { label:"Lever le pied et écouter ton corps", effect:()=>({d:{health:8, skill:-1}, result:"Un choix raisonnable pour tenir sur la durée." }) },
    ]},
  { cat:"Entraînement", rarity:"peu_commun", prompt:"Ta salle d'entraînement habituelle est fermée plusieurs jours suite à un dégât des eaux.",
    choices:[
      { label:"Trouver une salle de secours en urgence", effect:()=>({d:{money:-rand(200,600), skill:1}, result:"Tu improvises, la préparation continue ailleurs." }) },
      { label:"Profiter de ces jours off", effect:()=>({d:{moral:4, skill:-1}, result:"Un repos forcé plutôt bienvenu, finalement." }) },
    ]},
  { cat:"Entraînement", rarity:"rare", prompt:"Lors d'un sparring intense, tu domines totalement un partenaire réputé pourtant très solide.",
    choices:[
      { label:"Continuer à pousser le rythme", effect:()=>({d:{skill:4, moral:6, aura:2}, result:"Toute la salle commence à parler de ta séance." }) },
      { label:"Lever le pied par respect", effect:()=>({d:{skill:2, coachRelation:3}, result:"Un geste apprécié, sans casser l'ambiance du groupe." }) },
    ]},
  { cat:"Entraînement", rarity:"rare", prompt:"Un(e) champion(ne) en activité, de passage dans ta région, vient s'entraîner discrètement dans ta salle.",
    cond:(s)=> (s.reputation||0)>=35,
    choices:[
      { label:"Lui demander quelques rounds de sparring", effect:(s)=>{
          const ns = { d:{ skill:4, mental:3, aura:3,
            addPersistent:{ id:"mentorat_champion", label:"Conseils d'un champion", icon:"🥋", type:"buff",
              effects:{ winChanceBonus:2 }, weeksLeft: 30 } },
            result:"L'échange est intense et formateur — cette confiance en toi ne te quittera plus pendant un moment." };
          return ns;
        } },
      { label:"Le/la regarder s'entraîner sans s'imposer", effect:()=>({d:{moral:3, skill:1}, result:"Tu apprends déjà beaucoup rien qu'en observant." }) },
    ]},
  { cat:"Entraînement", rarity:"peu_commun", prompt:"Ton club organise un stage gratuit avec un intervenant extérieur de qualité.",
    choices:[
      { label:"Y participer à fond", effect:()=>({d:{skill:2.5, energie:-5}, result:"Un excellent complément gratuit à ta préparation habituelle." }) },
      { label:"Passer ton tour cette fois", effect:()=>({d:{}, result:"Tu préfères garder ton rythme habituel." }) },
    ]},

  // ================= VIE PRIVÉE =================
  { cat:"Vie privée", rarity:"peu_commun", prompt:"Après plusieurs années ensemble, ton/ta partenaire et toi décidez de vous marier.",
    choices:[
      { label:"Organiser une grande cérémonie", effect:()=>({d:{money:-rand(4000,12000), moral:14}, result:"Un jour inoubliable, malgré la facture salée." }) },
      { label:"Rester sobre et intime", effect:()=>({d:{money:-rand(500,1500), moral:10}, result:"Une cérémonie simple mais tout aussi sincère." }) },
    ]},
  { cat:"Vie privée", rarity:"rare", prompt:"Tu apprends que tu vas devenir parent.",
    choices:[
      { label:"Réorganiser ton emploi du temps autour de la famille", effect:()=>({d:{moral:12, coachRelation:-2,
          addPersistent:{ id:"jeune_parent", label:"Jeune parent", icon:"👶", type:"buff", effects:{ moralWeekly:0.4 }, weeksLeft: 40 } },
          result:"La nouvelle bouleverse positivement ton quotidien, malgré un planning plus complexe." }) },
      { label:"Continuer la carrière sans rien changer", effect:()=>({d:{moral:-4, skill:1}, result:"Tu restes focus sur le sport, au prix de tensions à la maison." }) },
    ]},
  { cat:"Vie privée", rarity:"commun", prompt:"Ton couple traverse une période difficile et la séparation se profile.",
    choices:[
      { label:"Te réfugier dans le travail", effect:()=>({d:{moral:-10, skill:2}, result:"Tu encaisses la rupture en redoublant d'efforts à l'entraînement." }) },
      { label:"Prendre du temps pour toi", effect:()=>({d:{moral:-4, health:2}, result:"Tu t'accordes de la douceur pour encaisser le coup." }) },
    ]},
  { cat:"Vie privée", rarity:"commun", prompt:"Tu envisages sérieusement un déménagement pour te rapprocher d'un meilleur environnement d'entraînement.",
    choices:[
      { label:"Déménager pour de bon", effect:()=>({d:{money:-rand(2000,6000), skill:1.5, moral:2}, result:"Un nouveau départ, prometteur mais coûteux." }) },
      { label:"Rester dans tes habitudes", effect:()=>({d:{moral:1}, result:"Tu privilégies la stabilité de ton quotidien." }) },
    ]},
  { cat:"Vie privée", rarity:"peu_commun", prompt:"Tes finances te permettent enfin d'envisager l'achat d'un bien immobilier.",
    cond:(s)=> s.money>=20000,
    choices:[
      { label:"Acheter une maison", effect:()=>({d:{money:-rand(15000,25000), moral:8}, result:"Un vrai chez-toi, une stabilité précieuse dans une carrière incertaine." }) },
      { label:"Continuer à économiser", effect:()=>({d:{moral:1}, result:"Tu préfères garder ta trésorerie disponible pour l'instant." }) },
    ]},
  { cat:"Vie privée", rarity:"peu_commun", prompt:"Ton domicile est cambriolé pendant que tu étais en stage à l'étranger.",
    choices:[
      { label:"Porter plainte et sécuriser le logement", effect:()=>({d:{money:-rand(1000,4000), moral:-5}, result:"Un coup dur matériel, en plus du sentiment de violation." }) },
      { label:"Encaisser sans faire d'histoires", effect:()=>({d:{moral:-8}, result:"Tu tournes la page rapidement, sans forcément t'en remettre tout à fait." }) },
    ]},
  { cat:"Vie privée", rarity:"peu_commun", prompt:"Le rythme des camps et des combats finit par te vider complètement, moralement et physiquement.",
    choices:[
      { label:"T'accorder une vraie coupure", effect:()=>({d:{moral:10, health:6, skill:-2}, result:"Cette pause te permet de repartir sur de meilleures bases." }) },
      { label:"Continuer, coûte que coûte", effect:()=>({d:{moral:-14, health:-8,
          addPersistent:{ id:"epuisement_chronique", label:"Épuisement chronique", icon:"🥱", type:"debuff", effects:{ injuryRiskDelta:0.12 }, weeksLeft: 24 } },
          result:"Tu tiens le choc en apparence, mais ton corps te réclamera l'addition tôt ou tard." }) },
    ]},
  { cat:"Vie privée", rarity:"commun", prompt:"De vraies vacances loin de tout, pour la première fois depuis longtemps.",
    choices:[
      { label:"Déconnecter complètement", effect:()=>({d:{moral:12, skill:-2, health:4}, result:"Tu reviens ressourcé(e), même si le rythme de forme redémarre à zéro." }) },
      { label:"Garder un pied dans l'entraînement", effect:()=>({d:{moral:6, skill:0.5}, result:"Un compromis qui te permet de souffler sans tout arrêter." }) },
    ]},
  { cat:"Vie privée", rarity:"peu_commun", prompt:"Un proche est hospitalisé et tu dois réorganiser ta semaine en urgence.",
    choices:[
      { label:"Être présent à ses côtés", effect:()=>({d:{moral:-4, skill:-1.5}, result:"La famille passe avant tout, la préparation attendra." }) },
      { label:"Rester concentré sur ton camp", effect:()=>({d:{moral:-8, skill:1}, result:"Un choix qui pèse lourd sur ta conscience." }) },
    ]},
  { cat:"Vie privée", rarity:"tres_commun", prompt:"Ta famille organise un grand repas de soutien avant ton prochain combat.",
    choices:[
      { label:"Profiter pleinement du moment", effect:()=>({d:{moral:7}, result:"Ce soutien te fait un bien fou avant l'échéance." }) },
    ]},

  // ================= FINANCES =================
  { cat:"Finances", rarity:"peu_commun", prompt:"Un contrôle fiscal de routine porte sur tes revenus de l'année passée.",
    cond:(s)=> (s.money||0) > 4000 && (s.money||0) <= 15000,
    choices:[
      { label:"Régulariser sans attendre", effect:()=>({d:{money:-rand(1000,3000)}, result:"C'est réglé rapidement, sans complication majeure." }) },
      { label:"Contester certains points", effect:()=>{ const win = Math.random()<0.4; return win? {d:{}, result:"Ta contestation aboutit, aucun redressement finalement."} : {d:{money:-rand(2000,5000), moral:-2}, result:"La contestation échoue et coûte finalement plus cher."}; } },
    ]},
  { cat:"Finances", rarity:"rare", prompt:"Un ami féru de cryptomonnaies te propose de placer une grosse somme sur un projet prometteur.",
    choices:[
      { label:"Tenter le pari", effect:()=>{ const win=Math.random()<0.3; return win? {d:{money:rand(15000,40000)}, result:"Le pari paie gros, ton compte en banque s'en réjouit."} : {d:{money:-rand(10000,25000), moral:-4}, result:"Le projet s'effondre, l'investissement part en fumée."}; } },
      { label:"Décliner poliment", effect:()=>({d:{}, result:"Tu préfères ne pas jouer avec tes économies." }) },
    ]},
  { cat:"Finances", rarity:"rare", prompt:"Une grande marque d'équipementier sportif veut faire de toi une de ses têtes d'affiche mondiales.",
    cond:(s)=> (s.hype||0)>=45 && (s.reputation||0)>=30,
    choices:[
      { label:"Signer ce contrat majeur", effect:()=>({d:{money:rand(20000,45000), reputation:3,
          addPersistent:{ id:"sponsor_premium", label:"Sponsor premium mondial", icon:"👟", type:"buff", effects:{ payMult:0.12, hypeBonus:1.5 }, weeksLeft: 52 } },
          result:"Un contrat qui change la donne financièrement, avec une visibilité mondiale à la clé." }) },
      { label:"Refuser pour garder ta liberté d'image", effect:()=>({d:{moral:3, aura:2}, result:"Tu conserves un contrôle total sur ton image, sans le chèque." }) },
    ]},
  { cat:"Finances", rarity:"peu_commun", prompt:"Un petit commerce local te propose un partenariat modeste mais sincère.",
    choices:[
      { label:"Accepter, chaque soutien compte", effect:()=>({d:{money:rand(500,2000), moral:2}, result:"Un partenariat simple, ancré dans ta communauté locale." }) },
      { label:"Décliner, tu vises plus grand", effect:()=>({d:{}, result:"Tu préfères attendre une offre à ta mesure." }) },
    ]},
  { cat:"Finances", rarity:"peu_commun", prompt:"Ton sponsor principal met fin au contrat sans préavis suite à une restructuration interne.",
    cond:(s)=> hasPersistentState(s, "sponsor_premium"),
    choices:[
      { label:"Chercher un remplaçant en urgence", effect:()=>{ const found=Math.random()<0.5; return found? {d:{money:rand(3000,9000), removePersistent:"sponsor_premium"}, result:"Un nouveau sponsor comble en partie le vide laissé."} : {d:{moral:-5, removePersistent:"sponsor_premium"}, result:"Aucun remplaçant à la hauteur pour l'instant."}; } },
      { label:"Encaisser sans réagir", effect:()=>({d:{moral:-4, removePersistent:"sponsor_premium"}, result:"Un manque à gagner que tu digères tant bien que mal." }) },
    ]},
  { cat:"Finances", rarity:"rare", prompt:"Ton organisation t'accorde une prime exceptionnelle après un combat qui a marqué les esprits.",
    cond:(s)=> (s.fightsOfTheYear||0) >= 1,
    choices:[
      { label:"Encaisser cette reconnaissance financière", effect:()=>({d:{money:rand(8000,20000), moral:5}, result:"Une belle récompense pour un combat qui restera dans les mémoires." }) },
    ]},
  { cat:"Finances", rarity:"peu_commun", prompt:"Une commission disciplinaire t'inflige une amende suite à un comportement jugé inapproprié en conférence de presse.",
    choices:[
      { label:"Payer et tourner la page", effect:()=>({d:{money:-rand(1000,4000), moral:-2}, result:"L'amende est réglée, l'incident vite oublié médiatiquement." }) },
      { label:"Contester officiellement", effect:()=>{ const win=Math.random()<0.35; return win? {d:{}, result:"Le recours aboutit, l'amende est annulée."} : {d:{money:-rand(2000,6000), reputation:-2}, result:"Le recours échoue et ternit un peu plus ton image."}; } },
    ]},

  // ================= MÉDIAS =================
  { cat:"Médias", rarity:"commun", prompt:"Une interview télévisée tourne au fiasco : questions pièges, réponses maladroites.",
    choices:[
      { label:"Publier un communiqué pour clarifier", effect:()=>({d:{reputation:2, moral:-2}, result:"Le communiqué limite un peu la casse médiatique." }) },
      { label:"Laisser passer sans rien dire", effect:()=>({d:{reputation:-4}, result:"L'image écornée met du temps à se redorer." }) },
    ]},
  { cat:"Médias", rarity:"peu_commun", prompt:"Une interview se passe à merveille : charisme, répartie, sincérité — le public est conquis.",
    choices:[
      { label:"Multiplier ce genre de sorties médiatiques", effect:()=>({d:{reputation:5, hype:8, aura:2}, result:"Ton image publique grimpe en flèche après cette prestation." }) },
    ]},
  { cat:"Médias", rarity:"commun", prompt:"Un extrait de toi devient un mème très partagé sur les réseaux sociaux.",
    choices:[
      { label:"Surfer sur la tendance avec humour", effect:()=>({d:{hype:6, reputation:1}, result:"Tu joues le jeu et ça paie en visibilité." }) },
      { label:"Ignorer complètement le phénomène", effect:()=>({d:{hype:2}, result:"Le mème vit sa vie sans toi, mais te fait quand même connaître." }) },
    ]},
  { cat:"Médias", rarity:"rare", prompt:"Une vidéo de toi devient virale à l'échelle mondiale, bien au-delà du milieu du sport de combat.",
    choices:[
      { label:"Capitaliser à fond sur ce moment", effect:()=>({d:{hype:15, reputation:6, aura:3}, result:"Cette exposition inédite fait exploser ta notoriété." }) },
    ]},
  { cat:"Médias", rarity:"epique", prompt:"Une grande plateforme de streaming te propose un documentaire entièrement consacré à ta carrière.",
    cond:(s)=> (s.wins||0)>=15 && (s.reputation||0)>=50,
    choices:[
      { label:"Accepter et ouvrir les portes de ta vie", effect:()=>({d:{money:rand(10000,25000), reputation:6,
          addPersistent:{ id:"documentaire_diffuse", label:"Documentaire diffusé mondialement", icon:"🎬", type:"buff", effects:{ hypeBonus:2, reputationBonus:1 }, weeksLeft: null } },
          result:"Le documentaire cartonne, ta notoriété franchit un cap durable." }) },
      { label:"Refuser pour préserver ton intimité", effect:()=>({d:{moral:3}, result:"Tu gardes ta vie privée à l'abri des caméras." }) },
    ]},
  { cat:"Médias", rarity:"rare", prompt:"Le podcast le plus écouté du milieu t'invite pour un long format sans filtre.",
    cond:(s)=> (s.reputation||0)>=25,
    choices:[
      { label:"Te livrer sans retenue", effect:()=>{ const hit=Math.random()<0.6; return hit? {d:{hype:10, reputation:5}, result:"L'épisode marque les esprits, ta cote grimpe nettement."} : {d:{reputation:-3}, result:"Certains propos maladroits font un peu jaser après coup."}; } },
      { label:"Rester mesuré(e) et prudent(e)", effect:()=>({d:{hype:3}, result:"Un passage propre mais sans éclat particulier." }) },
    ]},
  { cat:"Médias", rarity:"peu_commun", prompt:"Un bad buzz éclate après des propos mal interprétés lors d'une story postée à la va-vite.",
    choices:[
      { label:"Présenter rapidement des excuses publiques", effect:()=>({d:{reputation:-2, moral:-2}, result:"Les excuses limitent la polémique, sans l'effacer complètement." }) },
      { label:"Ne pas réagir et laisser retomber", effect:()=>({d:{reputation:-6, moral:-4}, result:"Le silence est interprété comme un aveu, la polémique s'installe." }) },
    ]},
  { cat:"Médias", rarity:"rare", prompt:"Un faux scandale, entièrement monté de toutes pièces, circule sur toi.",
    choices:[
      { label:"Démonter publiquement les fausses accusations", effect:()=>{ const win=Math.random()<0.55; return win? {d:{reputation:6}, result:"Les preuves que tu apportes retournent l'opinion en ta faveur."} : {d:{reputation:-8, moral:-5}, result:"Malgré tes efforts, le doute persiste dans l'opinion publique."}; } },
      { label:"Laisser la vérité s'imposer avec le temps", effect:()=>({d:{moral:-3}, result:"Tu fais le pari du temps long, au prix d'un inconfort immédiat." }) },
    ]},
  { cat:"Médias", rarity:"rare", prompt:"Un(e) autre combattant(e) en vue te clashe publiquement pour créer le buzz avant un possible face-à-face.",
    choices:[
      { label:"Répondre avec la même intensité", effect:()=>({d:{hype:10, moral:-2,
          addPersistent:{ id:"rivalite_mediatique", label:"Rivalité médiatique active", icon:"🔥", type:"buff", effects:{ hypeBonus:1 }, weeksLeft: 26 } },
          result:"L'échange enflamme les réseaux, une vraie rivalité médiatique s'installe." }) },
      { label:"Snober la provocation avec classe", effect:()=>({d:{moral:2, aura:2}, result:"Ton calme tranche avec l'agitation ambiante, apprécié du public averti." }) },
    ]},

  // ================= SANTÉ =================
  { cat:"Santé", rarity:"tres_commun", prompt:"Un vulgaire rhume te cloue au lit deux jours en pleine préparation.",
    choices:[
      { label:"Te reposer sans culpabiliser", effect:()=>({d:{health:2, skill:-0.5}, result:"Deux jours de moins, mais un corps qui repart sur de bonnes bases." }) },
      { label:"T'entraîner quand même", effect:()=>({d:{health:-4, skill:0.5}, result:"Tu tiens le rythme au prix d'une fatigue supplémentaire." }) },
    ]},
  { cat:"Santé", rarity:"commun", prompt:"Une grippe carabinée te met complètement à l'arrêt une semaine.",
    choices:[
      { label:"Laisser le corps récupérer pleinement", effect:()=>({d:{injuredTurns:1, health:4}, result:"Une semaine de coupure totale, mais un retour en pleine forme." }) },
      { label:"Reprendre dès que possible, fièvre ou pas", effect:()=>({d:{health:-10, moral:-2}, result:"Un choix risqué qui prolonge finalement la convalescence." }) },
    ]},
  { cat:"Santé", rarity:"peu_commun", prompt:"Une vilaine coupure au sourcil s'infecte faute de soins adaptés après un sparring.",
    choices:[
      { label:"Consulter immédiatement", effect:()=>({d:{injuredTurns:rand(1,2), health:-4}, result:"Le traitement enraye l'infection avant qu'elle ne s'aggrave." }) },
      { label:"Attendre que ça passe tout seul", effect:()=>({d:{injuredTurns:rand(3,5), health:-10}, result:"L'infection s'aggrave, l'arrêt forcé est bien plus long que prévu." }) },
    ]},
  { cat:"Santé", rarity:"commun", prompt:"Une entorse à la cheville survient sur un mouvement mal maîtrisé à l'entraînement.",
    choices:[
      { label:"Respecter scrupuleusement le protocole de repos", effect:()=>({d:{injuredTurns:rand(2,3), health:-6}, result:"La cheville cicatrise proprement, sans séquelle notable." }) },
      { label:"Forcer le retour trop tôt", effect:()=>({d:{injuredTurns:rand(4,7), health:-12,
          addPersistent:{ id:"cheville_fragile", label:"Cheville fragilisée", icon:"🦵", type:"debuff", effects:{ injuryRiskDelta:0.06 }, weeksLeft: null } },
          result:"En forçant, tu installes une fragilité durable sur cette cheville." }) },
    ]},
  { cat:"Santé", rarity:"rare", prompt:"Une fracture sérieuse à la main t'immobilise pour un long moment.",
    choices:[
      { label:"Opter pour une prise en charge complète", effect:()=>({d:{injuredTurns:rand(6,10), health:-14}, result:"La convalescence est longue, mais la guérison s'annonce solide." }) },
      { label:"Reprendre l'entraînement dès que la douleur diminue un peu", effect:()=>({d:{injuredTurns:rand(9,14), health:-20,
          addPersistent:{ id:"main_fragile", label:"Main fragilisée chroniquement", icon:"🤚", type:"debuff", effects:{ injuryRiskDelta:0.08 }, weeksLeft: null } },
          result:"Une reprise précoce laisse une fragilité permanente sur cette main." }) },
    ]},
  { cat:"Santé", rarity:"rare", prompt:"Une commotion cérébrale, diagnostiquée après un sparring trop intense, inquiète ton staff médical.",
    choices:[
      { label:"Suivre le protocole complet sans négocier", effect:()=>({d:{injuredTurns:rand(4,7), health:-10, mental:-2}, result:"Le protocole est respecté à la lettre, la santé avant tout." }) },
      { label:"Écourter le protocole pour ne pas perdre de temps", effect:()=>({d:{injuredTurns:rand(2,3),
          addPersistent:{ id:"sequelles_commotion", label:"Séquelles de commotion", icon:"🧠", type:"debuff", effects:{ injuryRiskDelta:0.1 }, weeksLeft: null } },
          result:"Tu gagnes du temps, au prix d'une vulnérabilité durable aux coups à la tête." }) },
    ]},
  { cat:"Santé", rarity:"epique", prompt:"Après des mois de doute, une préparation physique enfin parfaitement calibrée transforme ton corps.",
    cond:(s)=> (s.age||18) < 33,
    choices:[
      { label:"Profiter de cette forme insolente", effect:()=>({d:{cardio:6, health:10, mental:3,
          addPersistent:{ id:"forme_optimale", label:"Forme physique optimale", icon:"💪", type:"buff", effects:{ winChanceBonus:3 }, weeksLeft: 20 } },
          result:"Tu n'as jamais été aussi prêt(e) physiquement — ça se ressentira sur plusieurs mois." }) },
    ]},
  { cat:"Santé", rarity:"peu_commun", prompt:"Un contrôle médical de routine te libère enfin d'une vieille douleur chronique qui te suivait depuis des mois.",
    cond:(s)=> hasPersistentState(s,"cheville_fragile") || hasPersistentState(s,"main_fragile") || hasPersistentState(s,"epuisement_chronique"),
    choices:[
      { label:"Profiter de ce nouveau départ physique", effect:(s)=>{
          const ids = ["cheville_fragile","main_fragile","epuisement_chronique"].filter(id=>hasPersistentState(s,id));
          const id = ids[0];
          return { d:{ health:8, removePersistent:id }, result:"Cette vieille gêne physique appartient enfin au passé." };
        } },
    ]},

  { cat:"Santé", rarity:"rare", prompt:"Une torsion violente du genou pendant un enchaînement au sol inquiète immédiatement ton staff.",
    choices:[
      { label:"Suivre une rééducation complète avant de reprendre", effect:()=>({d:{injuredTurns:rand(5,9), health:-14}, result:"La rééducation est longue mais rigoureuse, le genou tient bon par la suite." }) },
      { label:"Reprendre dès que la douleur s'atténue un peu", effect:()=>({d:{injuredTurns:rand(3,5), health:-8,
          addPersistent:{ id:"genou_chronique", label:"Genou fragilisé chroniquement", icon:"🦵", type:"debuff", effects:{ injuryRiskDelta:0.09 }, weeksLeft: null } },
          result:"Tu regagnes du temps sur l'arrêt, mais ce genou restera un point faible pour longtemps." }) },
    ]},

  // ================= ORGANISATIONS =================
  { cat:"Organisations", rarity:"peu_commun", prompt:"Une organisation régionale en pleine expansion te propose de rejoindre son roster.",
    cond:(s)=> (s.reputation||0)>=15 && !s.contract,
    choices:[
      { label:"Étudier sérieusement l'offre", effect:()=>({d:{hype:3}, result:"Une proposition de contrat formelle devrait suivre prochainement." }) },
      { label:"Attendre une offre plus prestigieuse", effect:()=>({d:{}, result:"Tu préfères patienter pour une meilleure vitrine." }) },
    ]},
  { cat:"Organisations", rarity:"rare", prompt:"Un dépisteur d'une grande organisation internationale assiste discrètement à l'un de tes combats.",
    cond:(s)=> (s.reputation||0)>=45,
    choices:[
      { label:"Le savoir te motive encore plus", effect:()=>({d:{moral:5, mental:2}, result:"Cette attention te pousse à hausser encore ton niveau d'exigence." }) },
    ]},
  { cat:"Organisations", rarity:"epique", prompt:"Après ton dernier titre, une offre de combat d'unification des ceintures atterrit sur la table.",
    cond:(s)=> (s.titles||0)>=1,
    choices:[
      { label:"Accepter ce combat au sommet", effect:()=>({d:{hype:12, reputation:4, aura:3}, result:"Le combat d'unification s'annonce, la pression monte d'un cran." }) },
      { label:"Différer pour mieux te préparer", effect:()=>({d:{moral:2}, result:"Tu préfères t'assurer d'arriver dans les meilleures conditions." }) },
    ]},
  { cat:"Organisations", rarity:"peu_commun", prompt:"L'organisation t'annonce en tête d'affiche de la prochaine soirée.",
    cond:(s)=> !!s.contract,
    choices:[
      { label:"Assumer pleinement ce statut", effect:()=>({d:{hype:8, reputation:2, moral:3}, result:"Être en Main Event confirme ta progression dans la hiérarchie." }) },
    ]},
  { cat:"Organisations", rarity:"rare", prompt:"L'organisation annule ton combat prévu, l'adversaire s'étant désisté au dernier moment.",
    cond:(s)=> !!s.contract,
    choices:[
      { label:"Réclamer une compensation financière", effect:()=>{ const ok = Math.random()<0.5; return ok? {d:{money:rand(1000,4000)}, result:"L'organisation accepte de te dédommager pour le préjudice."} : {d:{moral:-3}, result:"L'organisation refuse toute compensation, tu encaisses la déception."}; } },
      { label:"Accepter sans faire de vagues", effect:()=>({d:{moral:-2}, result:"Tu restes bon joueur, en attendant une nouvelle date." }) },
    ]},
  { cat:"Organisations", rarity:"peu_commun", prompt:"On te propose de co-headliner une grande soirée aux côtés d'un nom bien plus connu que le tien.",
    cond:(s)=> !!s.contract,
    choices:[
      { label:"Saisir cette belle vitrine", effect:()=>({d:{hype:9, reputation:3}, result:"Cette exposition inédite profite largement à ta carrière." }) },
    ]},

  // ================= LÉGENDAIRES =================
  { cat:"Légendaire", rarity:"legendaire", prompt:"Une légende invaincue de la discipline, rarement visible en dehors des compétitions, passe plusieurs semaines à s'entraîner dans ta salle.",
    choices:[
      { label:"Lui demander de te prendre sous son aile", effect:()=>({d:{mental:6,
          addPersistent:{ id:"mentorat_legende", label:"Mentorat d'une légende invaincue", icon:"👑", type:"buff", effects:{ winChanceBonus:4, reputationBonus:1 }, weeksLeft: null },
          skillFocus:{ amount:5, discipline: null } },
          result:"Cette rencontre change durablement ta trajectoire — son enseignement te suivra toute ta carrière." }) },
      { label:"Observer avec humilité, sans rien demander", effect:()=>({d:{mental:3, moral:4}, result:"Rien que l'observer s'entraîner t'apprend énormément." }) },
    ]},
  { cat:"Légendaire", rarity:"legendaire", prompt:"Le lutteur le plus dominant de l'histoire de la discipline vient observer discrètement une de tes séances.",
    choices:[
      { label:"Solliciter ses conseils techniques", effect:()=>({d:{skillFocus:{amount:8, discipline:"lutte"}, mental:2}, result:"Quelques mots suffisent à corriger des détails qui te suivaient depuis des années." }) },
    ]},
  { cat:"Légendaire", rarity:"epique", prompt:"Le dirigeant le plus influent et le plus puissant du milieu assiste en personne à ton prochain combat.",
    cond:(s)=> !!s.contract,
    choices:[
      { label:"Te dire que c'est l'occasion de ta vie", effect:(s)=>({ d:{
          addPersistent:{ id:"sous_les_projecteurs", label:"Repéré par le boss", icon:"🕶️", type:"buff", effects:{ hypeBonus:1 }, weeksLeft: 12 } },
          result:"Sa présence ce soir-là pourrait tout changer si tu livres la performance attendue — victoire ou défaite, tout le monde en parlera." }) },
    ]},
  { cat:"Légendaire", rarity:"rare", prompt:"La superstar la plus clivante et la plus provocatrice du sport te clashe violemment sur les réseaux sociaux.",
    choices:[
      { label:"Répondre avec la même intensité", effect:()=>{ const buzz=Math.random()<0.6; return buzz? {d:{reputation:9, hype:14, moral:-2}, result:"L'échange fait le tour du monde, ta visibilité explose du jour au lendemain."} : {d:{reputation:-6}, result:"L'échange tourne à ton désavantage médiatiquement."}; } },
      { label:"Ignorer superbement la provocation", effect:()=>({d:{moral:4, aura:3}, result:"Ton silence tranche avec l'agitation — certains y voient une vraie force de caractère." }) },
    ]},
  { cat:"Légendaire", rarity:"epique", prompt:"Un vieux maître, presque oublié du grand public, accepte de te transmettre une technique qu'il gardait secrète depuis des décennies.",
    choices:[
      { label:"Consacrer plusieurs semaines à l'apprendre", effect:()=>({d:{techPoints:3, skillFocus:{amount:4, discipline:null},
          addPersistent:{ id:"technique_secrete", label:"Technique secrète maîtrisée", icon:"🗝️", type:"buff", effects:{ winChanceBonus:3 }, weeksLeft: null } },
          result:"Cette technique unique devient une vraie signature dans tes combats à venir." }) },
    ]},

  // ================= EXTRÊMEMENT RARES =================
  { cat:"Extrêmement rare", rarity:"mythique", prompt:"Tu traverses ce que ton entourage appelle déjà « le camp d'entraînement parfait » : chaque séance est meilleure que la précédente.",
    choices:[
      { label:"Vivre pleinement cet état de grâce", effect:()=>({d:{ skill:6, cardio:6, mental:6, chin:4, health:6,
          addPersistent:{ id:"camp_parfait", label:"Camp d'entraînement parfait", icon:"✨", type:"buff", effects:{ winChanceBonus:6, injuryRiskDelta:-0.05 }, weeksLeft: 14 } },
          result:"Tout s'aligne enfin : le corps, la tête, la technique. Cet état de forme rare va peser sur tes prochains combats." }) },
    ]},
  { cat:"Extrêmement rare", rarity:"mythique", prompt:"Contre toute attente, un bilan médical complet révèle que toutes tes anciennes blessures se sont miraculeusement résorbées.",
    choices:[
      { label:"Repartir sur des bases totalement neuves", effect:(s)=>{
          const chronicIds = ["cheville_fragile","main_fragile","sequelles_commotion","epuisement_chronique","genou_chronique"];
          const present = chronicIds.filter(id=>hasPersistentState(s,id));
          const d = { health:100-((s.health)||0), clearInjury:true, removePersistentList: present };
          return { d, result:"Un miracle médical inespéré : ton corps repart quasiment à neuf." };
        } },
    ]},
  { cat:"Extrêmement rare", rarity:"impossible", prompt:"Un concours de circonstances extraordinaire te propulse en une semaine au rang de phénomène mondial, bien au-delà du sport de combat.",
    choices:[
      { label:"Embrasser pleinement ce statut inédit", effect:()=>({d:{ reputation:60, hype:60, aura:15,
          addPersistent:{ id:"phenomene_mondial", label:"Phénomène mondial", icon:"🌍", type:"buff", effects:{ payMult:0.25, hypeBonus:3, reputationBonus:2 }, weeksLeft: null } },
          result:"Le monde entier découvre ton nom du jour au lendemain — ta carrière ne sera plus jamais la même." }) },
    ]},
  { cat:"Extrêmement rare", rarity:"impossible", prompt:"Le combat que tu viens de livrer entre instantanément dans l'histoire de la discipline, salué unanimement comme l'un des plus grands de tous les temps.",
    cond:(s)=> (s.fights||0) >= 5,
    choices:[
      { label:"Prendre pleinement conscience du moment", effect:()=>({d:{ reputation:40, money:rand(80000,200000), aura:10,
          addPersistent:{ id:"combat_historique", label:"Combat historique — Hall of Fame", icon:"🏛️", type:"buff", effects:{ reputationBonus:2, hypeBonus:2 }, weeksLeft: null } },
          result:"Ce combat restera gravé dans la mémoire collective du sport — ton nom entre définitivement dans la légende." }) },
    ]},

  // ================= NOUVEAUX HAPPENINGS : COMBAT =================
  { cat:"Combat", rarity:"tres_commun", prompt:"Ton adversaire tente un coup bas non intentionnel en plein round.",
    choices:[
      { label:"Demander une pause au docteur", effect:()=>({d:{health:2}, result:"Tu récupères quelques instants avant de reprendre l'action." }) },
      { label:"Continuer sans broncher", effect:()=>({d:{aura:2, moral:2}, result:"Le public salue ton mental d'acier." }) },
    ]},
  { cat:"Combat", rarity:"tres_commun", prompt:"Tu sens le combat basculer clairement en ta faveur dès le premier round.",
    choices:[
      { label:"Accélérer pour enfoncer le clou", effect:()=>({d:{skill:1, energie:-8}, result:"Tu mets une pression folle sur ton adversaire." }) },
      { label:"Gérer intelligemment ton avance", effect:()=>({d:{cardio:2}, result:"Tu gères ton effort sans te précipiter." }) },
    ]},
  { cat:"Combat", rarity:"commun", prompt:"Une coupure superficielle apparaît près de ton sourcil pendant l'échange.",
    cond:(s)=> s.lastFight && s.lastFight.hadCut,
    choices:[
      { label:"Ignorer et continuer", effect:()=>({d:{chin:-1}, result:"Le combat continue, la coupure n'inquiète pas le médecin." }) },
      { label:"Te faire rassurer par ton coin entre les rounds", effect:()=>({d:{moral:2}, result:"Ton coin te stabilise mentalement pour la suite." }) },
    ]},
  { cat:"Combat", rarity:"commun", prompt:"Ton adversaire commence à parler pendant l'échange pour te déstabiliser.",
    choices:[
      { label:"Répondre par des coups", effect:()=>({d:{skill:1, moral:-1}, result:"Tu réponds avec les poings plutôt qu'avec les mots." }) },
      { label:"Rester silencieux et concentré", effect:()=>({d:{mental:3}, result:"Tu ignores complètement la provocation." }) },
    ]},
  { cat:"Combat", rarity:"commun", prompt:"Le rythme du combat est bien plus rapide que prévu et ton cardio est mis à rude épreuve.",
    choices:[
      { label:"Puiser dans tes réserves", effect:()=>({d:{cardio:-6, moral:2}, result:"Tu tiens sur la volonté plus que sur le physique." }) },
      { label:"Ralentir légèrement le rythme", effect:()=>({d:{cardio:-2}, result:"Tu gères ton effort avec plus de prudence." }) },
    ]},
  { cat:"Combat", rarity:"peu_commun", prompt:"Un spectateur au bord de la cage crie des insultes personnelles pendant l'entre-round.",
    choices:[
      { label:"L'ignorer totalement", effect:()=>({d:{mental:3}, result:"Rien ne peut te sortir de ta concentration." }) },
      { label:"Le pointer du doigt après le combat", effect:()=>({d:{hype:4, reputation:-1}, result:"Le clash fait parler, pour le meilleur et pour le pire." }) },
    ]},
  { cat:"Combat", rarity:"peu_commun", prompt:"Ton protège-dents tombe en plein échange et l'arbitre doit stopper brièvement l'action.",
    choices:[
      { label:"Rester focus malgré l'interruption", effect:()=>({d:{mental:2}, result:"Tu ne perds pas le fil malgré la coupure." }) },
      { label:"En profiter pour souffler un instant", effect:()=>({d:{cardio:3}, result:"Cette pause improvisée te fait du bien." }) },
    ]},
  { cat:"Combat", rarity:"peu_commun", prompt:"Tu perçois une faille technique évidente dans la garde de ton adversaire en plein combat.",
    choices:[
      { label:"L'exploiter immédiatement", effect:()=>({d:{skill:2, aura:2}, result:"Ton sens tactique impressionne les observateurs." }) },
      { label:"Attendre le bon moment pour frapper", effect:()=>({d:{mental:2}, result:"Tu patientes pour agir au moment parfait." }) },
    ]},
  { cat:"Combat", rarity:"peu_commun", prompt:"L'arbitre se met accidentellement sur ta trajectoire en plein échange.",
    choices:[
      { label:"Ralentir pour éviter tout contact", effect:()=>({d:{cardio:-1}, result:"Tu gères la situation sans incident, au prix d'un temps de réaction perdu." }) },
      { label:"Continuer ton mouvement sans y penser", effect:()=>({d:{moral:1}, result:"L'arbitre esquive de justesse, l'action continue normalement." }) },
    ]},
  { cat:"Combat", rarity:"rare", prompt:"Un coup accidentel à l'arrière du crâne te sonne brièvement sans que l'arbitre n'intervienne.",
    choices:[
      { label:"Serrer les dents et continuer", effect:()=>({d:{chin:-3, health:-4}, result:"Tu termines le combat sur les réserves, en pilotage automatique." }) },
      { label:"Jouer la prudence le temps de récupérer", effect:()=>({d:{cardio:-2}, result:"Tu gagnes quelques secondes précieuses pour te reconstruire." }) },
    ]},
  { cat:"Combat", rarity:"rare", prompt:"Le public entier scande ton nom en plein milieu du combat, portant littéralement ton énergie.",
    cond:(s)=> s.lastFight && s.lastFight.win,
    choices:[
      { label:"Puiser dans cette énergie collective", effect:()=>({d:{moral:6, aura:3, energie:4}, result:"La salle entière semble combattre à tes côtés." }) },
    ]},
  { cat:"Combat", rarity:"rare", prompt:"Ton adversaire simule une blessure pour gagner du temps de récupération pendant le combat.",
    choices:[
      { label:"Signaler la manœuvre à l'arbitre", effect:()=>({d:{reputation:1}, result:"L'arbitre reste attentif après ton signalement." }) },
      { label:"Rester concentré sur ton plan de jeu", effect:()=>({d:{mental:2}, result:"Tu ne te laisses pas distraire par la manœuvre." }) },
    ]},
  { cat:"Combat", rarity:"rare", prompt:"Un problème d'éclairage plonge brièvement la cage dans la pénombre en plein round.",
    choices:[
      { label:"Garder ton sang-froid malgré la confusion", effect:()=>({d:{mental:3}, result:"Tu restes calme pendant que la salle retient son souffle." }) },
    ]},
  { cat:"Combat", rarity:"epique", prompt:"En plein combat, tu ressens une lucidité totale : chaque mouvement de ton adversaire semble prévisible d'avance.",
    cond:(s)=> s.lastFight && s.lastFight.win,
    choices:[
      { label:"Profiter pleinement de cet état de grâce", effect:()=>({d:{skill:3, aura:6, hype:5,
          addPersistent:{ id:"lucidite_combat", label:"Lucidité de combat", icon:"🧠", type:"buff", effects:{ winChanceBonus:2 }, weeksLeft: 10 } },
          result:"Ce moment de clarté totale restera gravé dans ta mémoire de combattant." }) },
    ]},
  { cat:"Combat", rarity:"legendaire", prompt:"Le combat est si spectaculaire que les organisateurs annoncent en direct une prime pour le combat de la soirée.",
    cond:(s)=> s.lastFight && (s.lastFight.finish || (s.hype||0) >= 55),
    choices:[
      { label:"Savourer cette reconnaissance immédiate", effect:()=>({d:{money:rand(10000,25000), hype:8, reputation:4}, result:"Ta performance restera dans les highlights de l'année." }) },
    ]},
  { cat:"Combat", rarity:"legendaire", prompt:"Un enchaînement que tu viens de placer est déjà surnommé par les commentateurs, en direct, comme un geste iconique.",
    cond:(s)=> s.lastFight && s.lastFight.win && s.lastFight.finish,
    choices:[
      { label:"Continuer sur ta lancée", effect:()=>({d:{hype:7, aura:5, reputation:3}, result:"La séquence tourne déjà en boucle sur les réseaux avant même la fin du combat." }) },
    ]},
  { cat:"Combat", rarity:"mythique", prompt:"Ton adversaire, dominé psychologiquement, abandonne verbalement en plein combat et refuse de continuer.",
    cond:(s)=> s.lastFight && s.lastFight.dominantWin,
    choices:[
      { label:"Accepter cette victoire particulière avec respect", effect:()=>({d:{reputation:5, aura:4, hype:6}, result:"Une victoire rare qui en dit long sur le rapport de force que tu as imposé." }) },
    ]},
  { cat:"Combat", rarity:"mythique", prompt:"Le combat est interrompu une minute par un incident technique — et tu passes ce temps à galvaniser la foule à mains nues.",
    cond:(s)=> s.lastFight && (s.hype||0) >= 40,
    choices:[
      { label:"Prendre le micro moral de la salle", effect:()=>({d:{hype:10, aura:5, moral:5}, result:"La salle est acquise à ta cause avant même la reprise du combat." }) },
    ]},
  { cat:"Combat", rarity:"impossible", prompt:"Ton adversaire s'effondre de lui-même en te voyant avancer, sans le moindre coup porté — un moment surréaliste que personne n'explique vraiment.",
    cond:(s)=> (s.aura||0) >= 55 && s.lastFight && s.lastFight.win,
    choices:[
      { label:"Rester interdit(e) devant la scène", effect:()=>({d:{aura:12, hype:15, reputation:8,
          addPersistent:{ id:"aura_legendaire", label:"Aura légendaire", icon:"👁️", type:"buff", effects:{ winChanceBonus:3, hypeBonus:2 }, weeksLeft: null } },
          result:"Cet instant improbable circule en boucle sur toutes les plateformes du monde entier." }) },
    ]},
  { cat:"Combat", rarity:"impossible", prompt:"En pleine action, une clameur inexplicable parcourt la salle : les caméras du monde entier viennent de capter, en simultané, ce qui sera reconnu comme LE combat du siècle.",
    cond:(s)=> (s.fights||0) >= 10 && (s.reputation||0) >= 60 && s.lastFight && s.lastFight.win,
    choices:[
      { label:"Vivre pleinement cet instant hors du temps", effect:()=>({d:{reputation:35, hype:25, aura:15, money:rand(50000,150000),
          addPersistent:{ id:"combat_du_siecle", label:"Combat du siècle", icon:"🌍", type:"buff", effects:{ hypeBonus:3, reputationBonus:3 }, weeksLeft: null } },
          result:"Ton nom vient d'entrer dans une conversation qui dépasse largement le sport." }) },
    ]},

  { cat:"Combat", rarity:"tres_commun", prompt:"Ton adversaire feint une ouverture pour te piéger dans son propre plan de jeu.",
    choices:[
      { label:"Mordre à l'hameçon prudemment", effect:()=>({d:{skill:1}, result:"Tu apprends de cette tentative de manipulation tactique." }) },
      { label:"Refuser catégoriquement l'échange", effect:()=>({d:{mental:2}, result:"Tu ne tombes pas dans le piège tendu." }) },
    ]},
  { cat:"Combat", rarity:"commun", prompt:"Un souci d'équipement (gant mal ajusté) te distrait quelques secondes en plein combat.",
    choices:[
      { label:"Continuer sans t'arrêter", effect:()=>({d:{moral:-1}, result:"Tu gères l'inconfort sans t'arrêter." }) },
      { label:"Signaler le problème à l'arbitre", effect:()=>({d:{cardio:1}, result:"L'arbitre t'accorde un court instant pour ajuster ton équipement." }) },
    ]},
  { cat:"Combat", rarity:"commun", prompt:"La foule est clairement acquise à ton adversaire, jouant à domicile.",
    choices:[
      { label:"Te nourrir de cette hostilité", effect:()=>({d:{moral:3, mental:2}, result:"Tu transformes l'adversité en carburant mental." }) },
      { label:"Rester imperturbable", effect:()=>({d:{mental:3}, result:"Le bruit de la salle ne t'atteint pas." }) },
    ]},
  { cat:"Combat", rarity:"peu_commun", prompt:"Ton coin te hurle des consignes contradictoires entre deux rounds.",
    choices:[
      { label:"Suivre ton propre instinct", effect:()=>({d:{mental:2, coachRelation:-1}, result:"Tu tranches seul(e), quitte à froisser ton coin." }) },
      { label:"Suivre les consignes du coach principal", effect:()=>({d:{coachRelation:2}, result:"Tu fais confiance à la voix la plus expérimentée de ton coin." }) },
    ]},
  { cat:"Combat", rarity:"peu_commun", prompt:"Tu ressens une décharge d'adrénaline inhabituelle au son de la cloche du dernier round.",
    choices:[
      { label:"Tout donner sur ce sprint final", effect:()=>({d:{skill:1, energie:-10, aura:2}, result:"Tu termines sur les rotules, mais dans le sursaut le plus intense de ta carrière." }) },
    ]},
  { cat:"Combat", rarity:"rare", prompt:"Un cut-man de légende, présent ce soir-là dans ton coin, referme une coupure de façon quasi miraculeuse entre deux rounds.",
    cond:(s)=> s.lastFight && s.lastFight.hadCut,
    choices:[
      { label:"Le remercier après le combat", effect:()=>({d:{chin:2, health:3}, result:"Ce professionnel vient peut-être de sauver ton combat." }) },
    ]},
  { cat:"Combat", rarity:"rare", prompt:"Ton adversaire, frustré, se met à enfreindre volontairement les règles à plusieurs reprises.",
    choices:[
      { label:"Garder ton calme malgré les fautes répétées", effect:()=>({d:{mental:3, reputation:2}, result:"Ton sang-froid contraste nettement avec son comportement." }) },
      { label:"Répondre avec la même intensité", effect:()=>({d:{moral:1, reputation:-2}, result:"Le combat tourne à l'affrontement pur." }) },
    ]},

  // ================= NOUVEAUX HAPPENINGS : ENTRAÎNEMENT =================
  { cat:"Entraînement", rarity:"tres_commun", prompt:"Une séance matinale de course à pied se déroule dans des conditions idéales.",
    choices:[
      { label:"Pousser un peu plus loin que prévu", effect:()=>({d:{cardio:2, energie:-5}, result:"Tu repousses tes limites sur cette sortie." }) },
      { label:"Respecter le programme initial", effect:()=>({d:{cardio:1}, result:"Une séance solide, sans excès." }) },
    ]},
  { cat:"Entraînement", rarity:"tres_commun", prompt:"Un exercice de mobilité révèle une petite raideur inhabituelle.",
    choices:[
      { label:"Forcer un peu pour l'assouplir", effect:()=>({d:{health:-2}, result:"Tu insistes malgré la gêne." }) },
      { label:"Lever le pied sur cet exercice", effect:()=>({d:{health:1}, result:"Tu préfères la prudence pour cette séance." }) },
    ]},
  { cat:"Entraînement", rarity:"commun", prompt:"Ton coach filme une séance pour analyser tes déplacements image par image.",
    choices:[
      { label:"Étudier attentivement les images", effect:()=>({d:{skill:1.5, mental:2}, result:"Tu identifies des détails que tu n'avais jamais remarqués." }) },
    ]},
  { cat:"Entraînement", rarity:"commun", prompt:"Une séance de force en salle se solde par un nouveau record personnel.",
    choices:[
      { label:"Célébrer cette progression physique", effect:()=>({d:{chin:1, moral:3}, result:"Ta puissance brute franchit un cap." }) },
    ]},
  { cat:"Entraînement", rarity:"commun", prompt:"Un partenaire d'entraînement plus léger que toi te met en difficulté par sa vitesse pure.",
    choices:[
      { label:"T'adapter à ce rythme rapide", effect:()=>({d:{skill:1, cardio:-2}, result:"Tu travailles ta vitesse d'exécution au contact." }) },
    ]},
  { cat:"Entraînement", rarity:"peu_commun", prompt:"Ton club met en place une séance conjointe avec une équipe de boxe olympique.",
    choices:[
      { label:"Absorber un maximum de conseils techniques", effect:()=>({d:{skillFocus:{amount:2.5, discipline:"boxe"}, mental:1}, result:"La finesse technique des boxeurs olympiques déteint sur ton jeu de mains." }) },
    ]},
  { cat:"Entraînement", rarity:"peu_commun", prompt:"Ton coach t'impose une semaine entière dédiée uniquement au travail au sol.",
    choices:[
      { label:"T'investir pleinement dans ce cycle", effect:()=>({d:{skillFocus:{amount:3, discipline:"grappling"}, energie:-6}, result:"Ton jeu au sol progresse nettement après cette immersion totale." }) },
    ]},
  { cat:"Entraînement", rarity:"peu_commun", prompt:"Une séance de sparring avec les yeux bandés (exercice sensoriel) surprend toute la salle.",
    choices:[
      { label:"Se prêter au jeu avec sérieux", effect:()=>({d:{mental:3, skill:1}, result:"Cet exercice inhabituel affine tes perceptions au combat." }) },
    ]},
  { cat:"Entraînement", rarity:"peu_commun", prompt:"Tu passes une soirée à visionner d'anciens combats de légendes de la discipline avec ton staff.",
    choices:[
      { label:"Prendre des notes détaillées", effect:()=>({d:{skill:1.5, mental:2}, result:"L'analyse d'archives enrichit ta compréhension du jeu." }) },
    ]},
  { cat:"Entraînement", rarity:"rare", prompt:"Un ancien champion, de passage, propose de superviser personnellement une séance dans ta salle.",
    choices:[
      { label:"Absorber chaque conseil avec attention", effect:()=>({d:{skill:3, aura:2, mental:2}, result:"Ce passage éclair restera une des séances les plus marquantes de ta carrière." }) },
    ]},
  { cat:"Entraînement", rarity:"rare", prompt:"Ta salle décroche un partenariat avec un laboratoire de préparation physique de pointe.",
    choices:[
      { label:"Suivre le programme personnalisé proposé", effect:()=>({d:{cardio:3, chin:2, money:-2000}, result:"Le suivi scientifique pousse ton physique vers un nouveau plafond." }) },
    ]},
  { cat:"Entraînement", rarity:"rare", prompt:"Un exercice de simulation de combat en conditions extrêmes (chaleur, altitude) est mis en place pour toi.",
    choices:[
      { label:"Relever le défi jusqu'au bout", effect:()=>({d:{cardio:4, mental:2, energie:-10}, result:"Ton corps s'adapte à des conditions que peu de combattants expérimentent." }) },
    ]},
  { cat:"Entraînement", rarity:"epique", prompt:"Ton coach t'annonce avoir développé, rien que pour toi, une technique inédite calquée sur ton profil physique.",
    choices:[
      { label:"Adopter cette arme sur mesure", effect:()=>({d:{skill:3, techPoints:1,
          addPersistent:{ id:"technique_sur_mesure", label:"Technique sur mesure", icon:"🔧", type:"buff", effects:{ winChanceBonus:2 }, weeksLeft: null } },
          result:"Cette arme unique, pensée pour toi seul(e), devient une signature de ton style." }) },
    ]},
  { cat:"Entraînement", rarity:"legendaire", prompt:"Un documentaire sportif de prestige choisit ta salle pour suivre ta préparation pendant plusieurs semaines.",
    choices:[
      { label:"Accepter cette exposition médiatique", effect:()=>({d:{hype:10, reputation:6, money:rand(5000,15000)}, result:"Ta préparation devient un objet de fascination pour tout un public." }) },
      { label:"Refuser pour préserver ta concentration", effect:()=>({d:{mental:3}, result:"Tu choisis la discrétion pour rester focalisé(e) sur l'essentiel." }) },
    ]},
  { cat:"Entraînement", rarity:"mythique", prompt:"Une révélation technique inattendue, lors d'une séance banale, change fondamentalement ta manière de combattre.",
    choices:[
      { label:"Reconstruire ton style autour de cette découverte", effect:()=>({d:{skill:5, techPoints:2,
          addPersistent:{ id:"revelation_technique", label:"Révélation technique", icon:"💡", type:"buff", effects:{ winChanceBonus:4 }, weeksLeft: null } },
          result:"Ce déclic redéfinit durablement ton identité de combattant." }) },
    ]},
  { cat:"Entraînement", rarity:"impossible", prompt:"Un scientifique du sport affirme, données à l'appui après des tests poussés, que ton profil physiologique est parmi les plus rares jamais mesurés dans la discipline.",
    cond:(s)=> (s.cardio||0) >= 70 && (s.chin||0) >= 70,
    choices:[
      { label:"Accueillir cette annonce avec humilité", effect:()=>({d:{cardio:6, chin:6, mental:4, hype:8,
          addPersistent:{ id:"profil_hors_norme", label:"Profil physiologique hors norme", icon:"🧬", type:"buff", effects:{ winChanceBonus:3 }, weeksLeft: null } },
          result:"Cette annonce scientifique fait le tour des médias spécialisés du monde entier." }) },
    ]},

  { cat:"Entraînement", rarity:"tres_commun", prompt:"Une séance de récupération active (piscine, vélo léger) fait du bien à ton corps.",
    choices:[
      { label:"En profiter pleinement", effect:()=>({d:{health:3, energie:4}, result:"Ton corps te remercie pour ce moment de récupération." }) },
    ]},
  { cat:"Entraînement", rarity:"commun", prompt:"Ton coach organise une séance de vidéo-analyse de ton futur adversaire.",
    choices:[
      { label:"Décortiquer chaque détail", effect:()=>({d:{mental:2, skill:1}, result:"Tu abordes la préparation avec un plan plus précis." }) },
    ]},
  { cat:"Entraînement", rarity:"peu_commun", prompt:"Un exercice collectif de méditation est instauré chaque matin dans ta salle.",
    choices:[
      { label:"T'investir dans cette routine mentale", effect:()=>({d:{mental:3, moral:2}, result:"Cette discipline nouvelle apaise ton esprit avant chaque séance." }) },
      { label:"Passer ton tour, peu convaincu(e)", effect:()=>({d:{}, result:"Tu préfères t'en tenir à tes habitudes." }) },
    ]},
  { cat:"Entraînement", rarity:"rare", prompt:"Une séance intense avec un partenaire de catégorie supérieure te pousse dans tes retranchements.",
    choices:[
      { label:"Tenir bon face à ce gabarit imposant", effect:()=>({d:{skill:2, chin:2, health:-5}, result:"Cette confrontation musclée forge ton mental et ta résistance." }) },
    ]},

  // ================= NOUVEAUX HAPPENINGS : BLESSURES =================
  { cat:"Blessures", rarity:"tres_commun", prompt:"Une gêne diffuse au poignet apparaît après une séance de frappe intense.",
    choices:[
      { label:"Appliquer de la glace et continuer prudemment", effect:()=>({d:{health:1}, result:"La gêne s'estompe rapidement avec les soins appropriés." }) },
      { label:"Ignorer et poursuivre normalement", effect:()=>({d:{health:-2}, result:"Tu prends un risque en continuant sans ménagement." }) },
    ]},
  { cat:"Blessures", rarity:"commun", prompt:"Une ampoule douloureuse gêne tes appuis lors des sparrings.",
    choices:[
      { label:"Adapter tes appuis en attendant la guérison", effect:()=>({d:{health:1}, result:"Un petit désagrément vite oublié." }) },
    ]},
  { cat:"Blessures", rarity:"commun", prompt:"Une douleur lombaire s'installe après une séance de lutte prolongée.",
    choices:[
      { label:"Consulter un kiné rapidement", effect:()=>({d:{money:-300, health:3}, result:"Le suivi thérapeutique évite une aggravation." }) },
      { label:"Attendre que ça passe seul", effect:()=>({d:{health:-3}, result:"La douleur persiste plus longtemps que prévu." }) },
    ]},
  { cat:"Blessures", rarity:"peu_commun", prompt:"Un choc à l'entraînement laisse ta main endolorie pendant plusieurs jours.",
    choices:[
      { label:"Faire examiner la main par précaution", effect:()=>({d:{money:-500, health:2}, result:"L'examen rassure sur l'absence de fracture." }) },
      { label:"Continuer à t'entraîner malgré la douleur", effect:()=>({d:{randomLocalizedInjury:true}, result:"La douleur ignorée finit par se transformer en véritable blessure localisée." }) },
    ]},
  { cat:"Blessures", rarity:"peu_commun", prompt:"Une entorse légère à la cheville survient lors d'un déplacement mal négocié.",
    choices:[
      { label:"Te reposer le temps nécessaire", effect:()=>({d:{injuredTurns:2, health:2}, result:"Une pause raisonnable évite d'aggraver la blessure." }) },
      { label:"Continuer à t'entraîner dessus", effect:()=>({d:{localizedInjury:{id:"cheville", label:"Cheville tordue", icon:"🦶", zone:"mobilite", weeksLeft: randInt(3,6)}}, result:"Tu forces le passage et la cheville reste fragile plus longtemps." }) },
    ]},
  { cat:"Blessures", rarity:"peu_commun", prompt:"Une douleur diffuse au genou apparaît après une séance de lutte trop intense.",
    choices:[
      { label:"Lever le pied sur les entraînements au sol", effect:()=>({d:{health:2}, result:"Tu évites le pire en levant le pied à temps." }) },
      { label:"Continuer les entraînements de lutte comme si de rien n'était", effect:()=>({d:{localizedInjury:{id:"genou", label:"Genou fragilisé", icon:"🦵", zone:"lutte", weeksLeft: randInt(6,10)}}, result:"Le genou finit par lâcher : une vraie blessure localisée s'installe." }) },
    ]},
  { cat:"Blessures", rarity:"rare", prompt:"Un accrochage malheureux à l'entraînement se solde par une petite fracture à la main.",
    cond:(s)=> true,
    choices:[
      { label:"Suivre scrupuleusement la convalescence", effect:()=>({d:{localizedInjury:{id:"main_cassee", label:"Main cassée", icon:"🤕", zone:"boxe", weeksLeft: randInt(5,8)}, money:-800}, result:"La main cassée met ta puissance de frappe entre parenthèses pour un moment." }) },
    ]},
  { cat:"Blessures", rarity:"rare", prompt:"Un coup mal placé lors d'un sparring provoque une douleur vive aux côtes.",
    choices:[
      { label:"Faire vérifier une éventuelle fissure", effect:()=>({d:{localizedInjury:{id:"cote_fissuree", label:"Côte fissurée", icon:"🩻", zone:"cardio", weeksLeft: randInt(4,7)}, money:-400}, result:"La radio confirme une fissure : ta respiration en pâtira quelque temps." }) },
      { label:"Espérer que ce n'est qu'un hématome", effect:()=>({d:{health:-4}, result:"Tu prends le risque de continuer sans certitude." }) },
    ]},
  { cat:"Blessures", rarity:"rare", prompt:"Une vieille douleur à l'épaule refait surface après une séance de striking intensive.",
    choices:[
      { label:"Adapter ta préparation autour de cette fragilité", effect:()=>({d:{localizedInjury:{id:"epaule", label:"Épaule instable", icon:"💢", zone:"grappling", weeksLeft: randInt(5,8)}}, result:"Tu composes désormais avec cette épaule instable pendant ta préparation." }) },
    ]},
  { cat:"Blessures", rarity:"epique", prompt:"Un examen médical de routine détecte une fragilité osseuse insoupçonnée à surveiller de près.",
    choices:[
      { label:"Adapter durablement ta charge d'entraînement", effect:()=>({d:{health:4, mental:2,
          addPersistent:{ id:"suivi_medical_renforce", label:"Suivi médical renforcé", icon:"🩺", type:"buff", effects:{ injuryRiskDelta:-0.15 }, weeksLeft: null } },
          result:"Ce suivi médical renforcé, désormais permanent, réduit sensiblement tes risques futurs." }) },
    ]},
  { cat:"Blessures", rarity:"legendaire", prompt:"Après une convalescence longue et difficile, tu reviens plus fort(e) et plus déterminé(e) que jamais.",
    cond:(s)=> (s.injuredTurns||0) === 0 && (s.injuryCount||0) >= 2,
    choices:[
      { label:"Transformer cette épreuve en force mentale", effect:()=>({d:{mental:6, chin:4, moral:6,
          addPersistent:{ id:"resilience_forgee", label:"Résilience forgée", icon:"🔥", type:"buff", effects:{ winChanceBonus:2 }, weeksLeft: null } },
          result:"Cette épreuve traversée devient une force durable dans ta carrière." }) },
    ]},
  { cat:"Blessures", rarity:"mythique", prompt:"Contre toute attente, une blessure que les médecins jugeaient sérieuse guérit à une vitesse qui les laisse sans explication.",
    cond:(s)=> (s.injuredTurns||0) > 0,
    choices:[
      { label:"Reprendre l'entraînement immédiatement", effect:()=>({d:{clearInjury:true, health:8, moral:8}, result:"Ta capacité de récupération devient un sujet d'étude pour le staff médical." }) },
    ]},
  { cat:"Blessures", rarity:"impossible", prompt:"Une blessure que tout le monde pensait rédhibitoire pour ta carrière se résorbe totalement en l'espace d'une nuit — un cas jamais documenté dans la discipline.",
    cond:(s)=> (s.injuryCount||0) >= 3,
    choices:[
      { label:"Repartir plus fort(e) que jamais", effect:()=>({d:{health:15, chin:8, mental:8, hype:6,
          addPersistent:{ id:"guerison_impossible", label:"Guérison impossible", icon:"✨", type:"buff", effects:{ winChanceBonus:3 }, weeksLeft: null } },
          result:"Le corps médical n'a tout simplement aucune explication rationnelle à te fournir." }) },
    ]},

  { cat:"Blessures", rarity:"tres_commun", prompt:"Une petite contracture au mollet t'oblige à lever légèrement le pied.",
    choices:[
      { label:"Faire des étirements ciblés", effect:()=>({d:{health:1}, result:"La contracture se résorbe avec quelques étirements bien placés." }) },
    ]},
  { cat:"Blessures", rarity:"commun", prompt:"Un rhume tenace ralentit ta préparation cette semaine.",
    choices:[
      { label:"Lever un peu le pied pour récupérer", effect:()=>({d:{cardio:-1, health:2}, result:"Tu privilégies le repos pour évacuer ce rhume au plus vite." }) },
      { label:"Maintenir le rythme d'entraînement", effect:()=>({d:{health:-3}, result:"Tu insistes malgré la fatigue, au risque de prolonger la maladie." }) },
    ]},
  { cat:"Blessures", rarity:"peu_commun", prompt:"Une arcade fragilisée par un précédent combat s'ouvre à nouveau lors d'un sparring appuyé.",
    choices:[
      { label:"Faire suturer proprement par un médecin", effect:()=>({d:{localizedInjury:{id:"arcade_ouverte", label:"Arcade ouverte", icon:"🩸", zone:"coupure", weeksLeft: randInt(2,3)}, money:-250}, result:"La coupure est proprement recousue, mais elle reste sensible pour les prochains combats." }) },
    ]},
  { cat:"Blessures", rarity:"rare", prompt:"Une déshydratation sévère après une séance trop intense t'oblige à passer par la case perfusion.",
    choices:[
      { label:"Suivre les recommandations médicales à la lettre", effect:()=>({d:{money:-600, health:-5, cardio:-4}, result:"Cet épisode t'alerte durablement sur la gestion de ton hydratation." }) },
    ]},

  // ================= NOUVEAUX HAPPENINGS : SUITE COMBAT / ENTRAÎNEMENT / BLESSURES =================
  { cat:"Combat", rarity:"tres_commun", prompt:"Un round s'achève sur un échange à la limite du chaos, sans dominante nette.",
    choices:[
      { label:"Analyser froidement ce qui vient de se passer", effect:()=>({d:{mental:2}, result:"Tu gardes ta lucidité malgré le chaos de l'échange." }) },
    ]},
  { cat:"Combat", rarity:"commun", prompt:"Ton adversaire change radicalement de stratégie en cours de combat, te forçant à t'adapter.",
    choices:[
      { label:"T'adapter immédiatement", effect:()=>({d:{skill:1, mental:1}, result:"Ta capacité d'adaptation impressionne les observateurs." }) },
      { label:"Rester sur ton plan initial", effect:()=>({d:{moral:-1}, result:"Tu t'accroches à ton plan, au risque d'être pris de vitesse." }) },
    ]},
  { cat:"Combat", rarity:"commun", prompt:"Un round intense te laisse essoufflé(e) bien plus que prévu.",
    choices:[
      { label:"Récupérer intelligemment sur le round suivant", effect:()=>({d:{cardio:1}, result:"Tu géres ta respiration pour repartir sur de bonnes bases." }) },
    ]},
  { cat:"Combat", rarity:"peu_commun", prompt:"Une décision arbitrale discutable en ta défaveur fait grincer des dents dans la salle.",
    cond:(s)=> s.lastFight && !s.lastFight.win,
    choices:[
      { label:"Garder ton calme malgré la frustration", effect:()=>({d:{mental:2, reputation:2}, result:"Ton sang-froid face à l'injustice est salué publiquement." }) },
      { label:"Manifester bruyamment ton désaccord", effect:()=>({d:{hype:2, reputation:-2}, result:"Ta colère fait le buzz, sans forcément servir ton image." }) },
    ]},
  { cat:"Combat", rarity:"peu_commun", prompt:"Un point de suture posé avant le combat cède légèrement pendant l'échange.",
    cond:(s)=> s.lastFight && s.lastFight.hadCut,
    choices:[
      { label:"Continuer malgré le saignement", effect:()=>({d:{chin:-1}, result:"Tu poursuis, le médecin surveille de près." }) },
    ]},
  { cat:"Combat", rarity:"rare", prompt:"Un silence inhabituel s'abat sur la salle entière au moment où tu prends l'avantage.",
    cond:(s)=> s.lastFight && s.lastFight.win,
    choices:[
      { label:"Savourer ce moment suspendu", effect:()=>({d:{aura:3, moral:3}, result:"Ce silence pesant en dit plus long que n'importe quelle acclamation." }) },
    ]},
  { cat:"Entraînement", rarity:"tres_commun", prompt:"Une session de shadow-boxing devant miroir révèle un tic gestuel que tu ignorais.",
    choices:[
      { label:"Travailler activement à le corriger", effect:()=>({d:{skill:1}, result:"Tu élimines progressivement cette habitude repérée à temps." }) },
    ]},
  { cat:"Entraînement", rarity:"commun", prompt:"Ton coach t'impose un jeûne intermittent pour affiner ta composition corporelle.",
    choices:[
      { label:"Suivre le protocole avec rigueur", effect:()=>({d:{chin:1, energie:-3}, result:"Le protocole affine ton physique au prix d'un peu de fatigue." }) },
      { label:"Décliner cette méthode", effect:()=>({d:{coachRelation:-1}, result:"Tu préfères garder tes habitudes alimentaires actuelles." }) },
    ]},
  { cat:"Entraînement", rarity:"commun", prompt:"Une séance de yoga est intégrée à ton programme hebdomadaire.",
    choices:[
      { label:"T'investir dans cette discipline complémentaire", effect:()=>({d:{mental:2, health:1}, result:"La souplesse et la respiration progressent en parallèle du combat." }) },
    ]},
  { cat:"Entraînement", rarity:"peu_commun", prompt:"Un partenaire d'entraînement, gaucher, te pose des problèmes inhabituels de placement.",
    choices:[
      { label:"Travailler spécifiquement contre les gauchers", effect:()=>({d:{skill:1.5}, result:"Tu combles une lacune tactique importante face aux gauchers." }) },
    ]},
  { cat:"Entraînement", rarity:"peu_commun", prompt:"Ta salle investit dans un simulateur de réalité virtuelle pour l'analyse tactique.",
    choices:[
      { label:"Tester cette technologie de pointe", effect:()=>({d:{skill:2, mental:1, money:-1000}, result:"Cet outil high-tech t'ouvre une nouvelle manière de préparer tes combats." }) },
    ]},
  { cat:"Entraînement", rarity:"rare", prompt:"Un préparateur mental de renom accepte de te suivre pour une série de séances privées.",
    choices:[
      { label:"T'investir pleinement dans ce travail", effect:()=>({d:{mental:4, moral:3, money:-1500}, result:"Ton approche mentale franchit un cap grâce à ce suivi spécialisé." }) },
    ]},
  { cat:"Entraînement", rarity:"rare", prompt:"Un exercice de simulation face à plusieurs styles différents enchaînés en boucle épuise toute la salle.",
    choices:[
      { label:"Tenir jusqu'au bout de l'exercice", effect:()=>({d:{skill:2, cardio:2, energie:-12}, result:"Cette épreuve d'endurance tactique forge ton adaptabilité." }) },
    ]},
  { cat:"Entraînement", rarity:"epique", prompt:"Ton coach organise, en secret, un sparring surprise contre un champion en titre de passage.",
    choices:[
      { label:"Ne pas reculer face au défi", effect:()=>({d:{skill:3, aura:3, chin:2}, result:"Ce test grandeur nature révèle où tu te situes vraiment au sommet du sport." }) },
    ]},
  { cat:"Blessures", rarity:"tres_commun", prompt:"Une douleur passagère au cou apparaît après une séance de lutte.",
    choices:[
      { label:"Faire quelques étirements ciblés", effect:()=>({d:{health:1}, result:"La gêne disparaît rapidement." }) },
    ]},
  { cat:"Blessures", rarity:"commun", prompt:"Une petite tendinite au coude se déclare après une série de frappes répétées.",
    choices:[
      { label:"Adapter ta charge d'entraînement", effect:()=>({d:{health:2}, result:"Tu évites l'aggravation grâce à cette adaptation à temps." }) },
      { label:"Continuer sans changer ton programme", effect:()=>({d:{health:-3}, result:"La tendinite s'installe un peu plus durablement." }) },
    ]},
  { cat:"Blessures", rarity:"peu_commun", prompt:"Un choc à l'entraînement laisse une vilaine ecchymose sur la cuisse.",
    choices:[
      { label:"Traiter par le froid et le repos", effect:()=>({d:{health:2}, result:"L'ecchymose se résorbe sans complication." }) },
    ]},
  { cat:"Blessures", rarity:"rare", prompt:"Une chute mal négociée lors d'un exercice de projection abîme sérieusement ton épaule.",
    choices:[
      { label:"Consulter immédiatement un spécialiste", effect:()=>({d:{localizedInjury:{id:"epaule", label:"Épaule instable", icon:"💢", zone:"grappling", weeksLeft: randInt(5,8)}, money:-700}, result:"Le diagnostic confirme une fragilité qu'il faudra ménager." }) },
    ]},
  { cat:"Blessures", rarity:"epique", prompt:"Une blessure qui semblait mineure révèle, après examens approfondis, une complication plus sérieuse que prévu.",
    choices:[
      { label:"Suivre un protocole de soin renforcé", effect:()=>({d:{injuredTurns:3, money:-1200, mental:2}, result:"Un protocole rigoureux permet d'éviter le pire scénario." }) },
    ]},
  { cat:"Vie privée", rarity:"peu_commun", prompt:"Un happening rare : un ancien partenaire d'entraînement, devenu célèbre, te crédite publiquement dans une interview.",
    choices:[
      { label:"Le remercier publiquement en retour", effect:()=>({d:{reputation:3, hype:2}, result:"Ce témoignage renforce ta crédibilité auprès du public." }) },
    ]},
  { cat:"Combat", rarity:"tres_commun", prompt:"Ton adversaire teste ton menton avec un jab appuyé dès les premières secondes.",
    choices:[
      { label:"Encaisser sans ciller", effect:()=>({d:{chin:1, moral:1}, result:"Tu envoies un message clair sur ta solidité." }) },
      { label:"Reculer prudemment", effect:()=>({d:{cardio:1}, result:"Tu préfères jauger la situation avant de t'engager." }) },
    ]},
  { cat:"Combat", rarity:"commun", prompt:"Un léger différend sur le poids de pesée refait surface juste avant l'entrée en cage.",
    choices:[
      { label:"Ne pas te laisser distraire", effect:()=>({d:{mental:2}, result:"Tu restes focus malgré la polémique de dernière minute." }) },
    ]},
  { cat:"Combat", rarity:"peu_commun", prompt:"Une pluie de flashs t'accueille à l'entrée en salle, plus intense que d'habitude.",
    choices:[
      { label:"Te nourrir de cette effervescence", effect:()=>({d:{hype:3, aura:2}, result:"L'ambiance électrique de la soirée te galvanise." }) },
    ]},
  { cat:"Combat", rarity:"rare", prompt:"Ton walkout (entrée sur le ring) devient viral pour sa mise en scène.",
    choices:[
      { label:"Capitaliser sur ce moment", effect:()=>({d:{hype:6, aura:2}, result:"Ton entrée fait déjà parler avant même le premier coup." }) },
    ]},
  { cat:"Entraînement", rarity:"commun", prompt:"Un exercice de respiration contrôlée est intégré à ta routine de récupération.",
    choices:[
      { label:"Adopter cette pratique sur le long terme", effect:()=>({d:{mental:1, cardio:1}, result:"Cette routine simple améliore ta gestion du stress au fil du temps." }) },
    ]},
  { cat:"Entraînement", rarity:"peu_commun", prompt:"Un partenaire d'entraînement expérimenté te transmet une astuce de préparation mentale d'avant-combat.",
    choices:[
      { label:"L'intégrer à ton rituel personnel", effect:()=>({d:{mental:2}, result:"Ce petit rituel devient une habitude précieuse avant chaque combat." }) },
    ]},
  { cat:"Entraînement", rarity:"rare", prompt:"Une séance de striking filmée en très haute vitesse révèle un détail technique invisible à l'œil nu.",
    choices:[
      { label:"Corriger immédiatement ce détail", effect:()=>({d:{skill:2}, result:"Ce micro-ajustement technique change subtilement ton efficacité." }) },
    ]},
  { cat:"Blessures", rarity:"commun", prompt:"Une crampe soudaine te surprend en fin de séance intensive.",
    choices:[
      { label:"T'étirer immédiatement", effect:()=>({d:{health:1}, result:"La crampe se dissipe rapidement grâce à l'étirement." }) },
    ]},
  { cat:"Blessures", rarity:"peu_commun", prompt:"Une gêne récurrente au poignet t'oblige à envisager un strapping permanent en combat.",
    choices:[
      { label:"Adopter ce strapping préventif", effect:()=>({d:{health:2}, result:"Cette précaution simple limite le risque d'aggravation." }) },
    ]},
  { cat:"Blessures", rarity:"rare", prompt:"Un choc répété à la tête sur plusieurs séances inquiète ton staff médical.",
    choices:[
      { label:"Accepter un protocole de repos cérébral", effect:()=>({d:{injuredTurns:2, mental:3}, result:"Cette précaution, bien qu'impatientante, protège ta santé à long terme." }) },
      { label:"Refuser et continuer normalement", effect:()=>({d:{chin:-2, health:-3}, result:"Tu prends un risque que ton staff médical déconseille fortement." }) },
    ]},
  { cat:"Carrière", rarity:"legendaire", prompt:"Une chaîne de télévision internationale propose de consacrer un épisode spécial entier à ta trajectoire.",
    choices:[
      { label:"Accepter cette exposition mondiale", effect:()=>({d:{hype:9, reputation:5, money:rand(8000,20000)}, result:"Ta trajectoire personnelle touche un public bien au-delà des amateurs de MMA." }) },
    ]},
  { cat:"Carrière", rarity:"mythique", prompt:"Une organisation rivale historique te fait une offre extravagante pour rejoindre ses rangs en pleine gloire.",
    choices:[
      { label:"Écouter attentivement cette proposition", effect:()=>({d:{reputation:4, hype:5}, result:"Cette convoitise confirme ton statut au sommet de la discipline." }) },
    ]},
  { cat:"Combat", rarity:"tres_commun", prompt:"Ton adversaire tente une feinte grossière que tu repères immédiatement.",
    choices:[
      { label:"Punir cette erreur tactique", effect:()=>({d:{skill:1}, result:"Tu sanctionnes cette lecture facile du jeu adverse." }) },
    ]},
  { cat:"Entraînement", rarity:"commun", prompt:"Une séance de renforcement du cou est ajoutée à ton programme pour mieux encaisser les coups.",
    choices:[
      { label:"T'y investir sérieusement", effect:()=>({d:{chin:2}, result:"Ton menton gagne en résistance au fil des semaines." }) },
    ]},
  { cat:"Blessures", rarity:"peu_commun", prompt:"Une gêne au bas du dos réapparaît après un long trajet en avion vers un combat.",
    choices:[
      { label:"Consulter un ostéopathe dès l'arrivée", effect:()=>({d:{money:-350, health:2}, result:"Cette consultation rapide règle le problème avant le combat." }) },
    ]},

  // ================= NOUVEAUX HAPPENINGS : COHÉRENCE AVEC L'ISSUE DU DERNIER COMBAT =================
  // Chaque événement ci-dessous vérifie l'état réel du combat qui vient de se dérouler
  // (s.lastFight, voir resolveFight) pour ne jamais raconter un moment qui contredirait ce qui
  // vient de se passer sur l'octogone (impossible de "dominer psychologiquement" après une
  // défaite, de fêter un titre qu'on n'a pas gagné, etc.).
  { cat:"Combat", rarity:"commun", prompt:"Cette victoire aux points, sans éclat particulier, laisse un goût mitigé malgré le résultat.",
    cond:(s)=> s.lastFight && s.lastFight.win && s.lastFight.methodCode==="decision" && !s.lastFight.dominantWin,
    choices:[
      { label:"Savourer la victoire quoi qu'il arrive", effect:()=>({d:{moral:3}, result:"Une victoire reste une victoire, et tu comptes bien la savourer." }) },
      { label:"Te promettre de viser la finition la prochaine fois", effect:()=>({d:{skill:1, mental:1}, result:"Tu ressors de ce combat avec une idée claire de ce qu'il faut travailler." }) },
    ]},
  { cat:"Combat", rarity:"peu_commun", prompt:"Un round à peine entamé et déjà terminé : ta rapidité d'exécution impressionne toute la salle.",
    cond:(s)=> s.lastFight && s.lastFight.win && s.lastFight.finish && s.lastFight.round===1,
    choices:[
      { label:"Savourer cette efficacité chirurgicale", effect:()=>({d:{aura:3, hype:3}, result:"Les highlights de ce round tournent déjà en boucle." }) },
      { label:"Rester humble malgré la rapidité", effect:()=>({d:{reputation:2, moral:2}, result:"Tu préfères parler du travail plutôt que du résultat spectaculaire." }) },
    ]},
  { cat:"Combat", rarity:"peu_commun", prompt:"Ta soumission arrache un cri au public : ton jeu au sol impressionne jusqu'aux experts les plus exigeants.",
    cond:(s)=> s.lastFight && s.lastFight.win && s.lastFight.methodCode==="soumission",
    choices:[
      { label:"Mettre en avant ton jeu au sol en interview", effect:()=>({d:{hype:3, aura:2}, result:"Les spécialistes saluent la précision technique de l'enchaînement." }) },
      { label:"Rester discret sur ta préparation spécifique", effect:()=>({d:{mental:2}, result:"Tu préfères garder tes secrets d'entraînement pour toi." }) },
    ]},
  { cat:"Combat", rarity:"peu_commun", prompt:"Tu ressors de cette défaite aux points la tête haute — le combat était en réalité bien plus serré qu'il n'y paraît de l'extérieur.",
    cond:(s)=> s.lastFight && !s.lastFight.win && !s.lastFight.dominated && !s.lastFight.embarrassingLoss && s.lastFight.methodCode==="decision",
    choices:[
      { label:"Analyser calmement les erreurs commises", effect:()=>({d:{mental:3}, result:"Tu tires les leçons de ce combat sans t'effondrer." }) },
      { label:"Contester publiquement le verdict des juges", effect:()=>({d:{hype:3, reputation:-2}, result:"Ta sortie fait parler, sans forcément arranger ton image." }) },
    ]},
  { cat:"Combat", rarity:"rare", prompt:"Cette défaite brutale laisse une trace profonde, sur le corps comme dans la tête.",
    cond:(s)=> s.lastFight && !s.lastFight.win && s.lastFight.dominated,
    choices:[
      { label:"Prendre le temps qu'il faut pour t'en remettre", effect:()=>({d:{moral:4, health:2}, result:"Tu acceptes de lever le pied plutôt que de forcer un retour précipité." }) },
      { label:"Vouloir déjà tout reprendre au plus vite", effect:()=>({d:{energie:-4, mental:-2}, result:"Ton envie de revanche immédiate inquiète un peu ton entourage." }) },
    ]},
  { cat:"Combat", rarity:"rare", prompt:"Personne ne t'attendait à ce niveau : tu viens de battre un adversaire nettement supérieur sur le papier.",
    cond:(s)=> s.lastFight && s.lastFight.upsetWin,
    choices:[
      { label:"Revendiquer ce nouveau statut haut et fort", effect:()=>({d:{hype:8, aura:5, reputation:3}, result:"Cet exploit change immédiatement la façon dont on parle de toi." }) },
      { label:"Rester modeste malgré l'exploit", effect:()=>({d:{reputation:5, moral:3}, result:"Ton humilité après un tel exploit force le respect." }) },
    ]},
  { cat:"Combat", rarity:"rare", prompt:"Cette victoire face à un adversaire que tu connais déjà par cœur a une saveur toute particulière.",
    cond:(s)=> s.lastFight && s.lastFight.win && s.lastFight.isRival && (s.lastFight.rivalMeetings||0) >= 1,
    choices:[
      { label:"Envoyer un message fort à ton rival", effect:()=>({d:{hype:5, aura:3}, result:"Cette rivalité continue de faire vendre des places, combat après combat." }) },
      { label:"Rester focus sur la suite de ta carrière", effect:()=>({d:{mental:3, reputation:2}, result:"Tu préfères ne pas t'attarder sur cette rivalité et regarder devant toi." }) },
    ]},
  { cat:"Combat", rarity:"rare", prompt:"Ceinture autour de la taille pour la première fois : ce moment restera gravé à jamais dans ta mémoire.",
    cond:(s)=> s.lastFight && s.lastFight.titleWon,
    choices:[
      { label:"Célébrer pleinement ce sommet", effect:()=>({d:{moral:8, hype:6}, result:"Toute la salle célèbre avec toi ce moment que tu n'oublieras jamais." }) },
      { label:"Penser déjà à la première défense", effect:()=>({d:{mental:4, aura:2}, result:"Tu sais déjà que le plus dur commence maintenant : rester au sommet." }) },
    ]},
  { cat:"Combat", rarity:"rare", prompt:"Ce résultat sans vainqueur ni vaincu laisse un sentiment d'inachevé difficile à digérer.",
    cond:(s)=> s.lastFight && (s.lastFight.noContest || s.lastFight.draw),
    choices:[
      { label:"Demander publiquement une revanche immédiate", effect:()=>({d:{hype:4, reputation:1}, result:"Le public partage ton envie de voir ce combat rejoué au plus vite." }) },
      { label:"Tourner rapidement la page", effect:()=>({d:{mental:2, moral:1}, result:"Tu préfères ne pas t'attarder sur un résultat que tu ne contrôlais pas." }) },
    ]},
  { cat:"Combat", rarity:"epique", prompt:"Tu as terminé le combat quasiment aveugle d'un œil, et tu as quand même fini par l'emporter.",
    cond:(s)=> s.lastFight && s.lastFight.win && s.lastFight.hadEyeInjury,
    choices:[
      { label:"Raconter cet exploit aux médias après le combat", effect:()=>({d:{hype:8, aura:5, reputation:3}, result:"Ton mental d'acier dans l'adversité devient la vraie histoire de la soirée." }) },
    ]},
  { cat:"Combat", rarity:"legendaire", prompt:"Trois victoires anticipées d'affilée : les observateurs commencent sérieusement à parler de toi comme d'un phénomène de la discipline.",
    cond:(s)=> s.lastFight && s.lastFight.win && s.lastFight.finish && (s.winStreak||0) >= 3,
    choices:[
      { label:"Assumer pleinement ce nouveau statut", effect:()=>({d:{hype:10, aura:6, reputation:4,
          addPersistent:{ id:"serie_finitions", label:"Série de finitions", icon:"🔥", type:"buff", effects:{ hypeBonus:1 }, weeksLeft: 16 } },
          result:"Ta série de finitions consécutives fait désormais partie de ta réputation sur le circuit." }) },
    ]},
  { cat:"Combat", rarity:"mythique", prompt:"Cette défense de titre écrasante fait déjà dire aux observateurs que ton règne pourrait durer des années.",
    cond:(s)=> s.lastFight && s.lastFight.win && s.lastFight.isTitle && s.lastFight.dominantWin,
    choices:[
      { label:"Accepter le poids de ce nouveau statut de dominateur", effect:()=>({d:{reputation:10, aura:8, hype:8,
          addPersistent:{ id:"regne_dominant", label:"Règne dominant", icon:"👑", type:"buff", effects:{ winChanceBonus:2, hypeBonus:1 }, weeksLeft: 20 } },
          result:"On commence à parler de toi comme du meilleur combattant de ta génération." }) },
    ]},
  { cat:"Médias", rarity:"peu_commun", prompt:"Les images de ta finition de ce soir tournent déjà en boucle sur toutes les chaînes sportives du pays.",
    cond:(s)=> s.lastFight && s.lastFight.win && s.lastFight.finish,
    choices:[
      { label:"Profiter pleinement de cette exposition médiatique", effect:()=>({d:{hype:4, reputation:2}, result:"Cette diffusion massive touche un public bien au-delà des amateurs habituels." }) },
      { label:"Rediriger l'attention vers ton équipe et ton camp", effect:()=>({d:{coachRelation:4, moral:2}, result:"Ton geste envers ton staff est remarqué et apprécié." }) },
    ]},

  // ================= ÉVÉNEMENTS TRÈS RARES (ajout) =================
  { cat:"Légendaire", rarity:"impossible", prompt:"Une légende revenue de sa retraite, contre toute attente, accepte de te livrer un dernier combat.",
    cond:(s)=> (s.fights||0) >= 10 && !!s.contract,
    choices:[
      { label:"Saisir cette occasion historique", effect:()=>{
          const win = Math.random() < 0.5;
          return win
            ? { d:{ reputation:22, hype:30, aura:14, money:rand(40000,120000),
                addPersistent:{ id:"vainqueur_legende", label:"Vainqueur d'une légende", icon:"🏛️", type:"buff", effects:{ reputationBonus:2, hypeBonus:1 }, weeksLeft: null } },
                result:"Tu bats une légende revenue spécialement pour ce combat — ton nom entre dans une autre dimension." }
            : { d:{ reputation:-4, moral:-6, hype:10 },
                result:"La légende, encore capable de tout, s'impose une dernière fois — mais avoir partagé la cage avec elle restera un honneur rare." };
        } },
      { label:"Décliner par respect pour son héritage", effect:()=>({d:{moral:4, reputation:2}, result:"Un choix salué par les puristes, même si l'occasion ne se représentera sans doute jamais." }) },
    ]},
  { cat:"Organisations", rarity:"legendaire", prompt:"Ton prochain combat est programmé dans un stade de plus de 80 000 personnes.",
    cond:(s)=> !!s.contract && (s.hype||0) >= 55,
    choices:[
      { label:"Se hisser à la hauteur de l'événement", effect:()=>({d:{ hype:14, reputation:6, aura:5, money:rand(15000,40000),
          addPersistent:{ id:"stade_plein", label:"Habitué des stades", icon:"🏟️", type:"buff", effects:{ hypeBonus:1 }, weeksLeft: 16 } },
          result:"Le rugissement de 80 000 personnes restera gravé en toi pour le reste de ta carrière." }) },
      { label:"Rester concentré malgré la pression du décor", effect:()=>({d:{mental:5, moral:2}, result:"Tu choisis de traiter ce combat comme n'importe quel autre, décor ou pas." }) },
    ]},
  { cat:"Organisations", rarity:"legendaire", prompt:"On t'annonce en combat principal d'un événement qui restera dans l'histoire de la discipline.",
    cond:(s)=> !!s.contract && ((s.titles||0)>=1 || (s.reputation||0)>=70),
    choices:[
      { label:"Endosser pleinement ce rôle de tête d'affiche", effect:()=>({d:{ hype:16, reputation:7, aura:6,
          addPersistent:{ id:"main_event_historique", label:"Main event historique", icon:"📜", type:"buff", effects:{ reputationBonus:1, hypeBonus:1 }, weeksLeft: 20 } },
          result:"Ton nom sera associé pour toujours à cette soirée que tout le milieu attend." }) },
      { label:"Garder les pieds sur terre avant l'échéance", effect:()=>({d:{mental:4, moral:3}, result:"Tu préfères ne pas te laisser griser avant même d'avoir combattu." }) },
    ]},
  { cat:"Médias", rarity:"legendaire", prompt:"Un studio propose de produire un film ou un documentaire retraçant ta carrière.",
    cond:(s)=> (s.reputation||0) >= 65,
    choices:[
      { label:"Ouvrir grand les portes de ta vie et de ton camp", effect:()=>({d:{ hype:12, reputation:5, money:rand(20000,60000),
          addPersistent:{ id:"documentaire_carriere", label:"Sujet d'un documentaire", icon:"🎬", type:"buff", effects:{ hypeBonus:1 }, weeksLeft: null } },
          result:"Le documentaire t'expose à un public qui ignorait tout du sport jusque-là." }) },
      { label:"Préserver ta tranquillité et refuser les caméras", effect:()=>({d:{moral:3, mental:2}, result:"Tu préfères protéger ta bulle plutôt que de l'exposer à l'écran." }) },
    ]},
  { cat:"Santé", rarity:"rare", prompt:"Une blessure survient à quelques jours seulement d'un combat de titre.",
    cond:(s)=> !!s.contract && (s.reputation||0) >= 55,
    choices:[
      { label:"Informer l'organisation et reporter le combat", effect:()=>({d:{injuredTurns: randInt(4,8), moral:-4, reputation:-2}, result:"Le combat de titre est reporté — frustrant, mais bien plus raisonnable que de forcer." }) },
      { label:"Cacher la blessure et combattre coûte que coûte", effect:()=>{
          const hold = Math.random() < 0.45;
          return hold
            ? { d:{ moral:6, aura:4, reputation:3 }, result:"Tu tiens le coup et personne ne se doute de rien — un pari risqué mais payant." }
            : { d:{ localizedInjury:{ id:"blessure_cachee", label:"Blessure aggravée en combat", weeksLeft: randInt(6,10) }, moral:-8, health:-10 },
                result:"La blessure lâche en plein combat et s'aggrave sérieusement faute d'avoir été soignée à temps." };
        } },
    ]},
  { cat:"Organisations", rarity:"peu_commun", prompt:"Un contrôle antidopage surprise, en dehors de tout calendrier annoncé, débarque à ta salle.",
    choices:[
      { label:"Te soumettre au contrôle sans inquiétude", effect:()=>{
          const clean = Math.random() < 0.92;
          return clean
            ? { d:{ moral:3, reputation:2 }, result:"Contrôle passé sans encombre — ta crédibilité en sort renforcée." }
            : { d:{ injuredTurns: randInt(6,10), reputation:-14, moral:-10 }, result:"Une erreur administrative fait suspendre ta licence le temps qu'un second labo confirme finalement ta bonne foi." };
        } },
    ]},
  { cat:"Organisations", rarity:"rare", prompt:"Ton adversaire est remplacé au pied levé le jour même du combat.",
    cond:(s)=> !!s.contract,
    choices:[
      { label:"T'adapter mentalement à ce changement de dernière minute", effect:()=>({d:{mental:4, moral:2}, result:"Tu encaisses l'imprévu avec calme — une vraie qualité de professionnel aguerri." }) },
      { label:"Protester auprès de l'organisation", effect:()=>{ const heard = Math.random()<0.4; return heard? {d:{money:rand(2000,6000)}, result:"L'organisation accepte de compenser financièrement ce changement imposé."} : {d:{moral:-3}, result:"L'organisation balaie ta protestation d'un revers de main."}; } },
    ]},
  { cat:"Organisations", rarity:"epique", prompt:"Une émission de télé-réalité façon The Ultimate Fighter te propose de devenir coach d'une saison entière.",
    cond:(s)=> (s.reputation||0) >= 60,
    choices:[
      { label:"Accepter ce rôle de mentor médiatisé", effect:()=>({d:{ hype:10, reputation:4, money:rand(10000,30000), health:-3,
          addPersistent:{ id:"coach_tele_realite", label:"Coach TV", icon:"📺", type:"buff", effects:{ hypeBonus:1 }, weeksLeft: 14 } },
          result:"L'émission te rend populaire bien au-delà du public habituel du sport de combat." }) },
      { label:"Décliner pour te concentrer sur ta propre carrière", effect:()=>({d:{mental:3, moral:2}, result:"Tu préfères garder toute ton énergie pour tes propres combats." }) },
    ]},
  { cat:"Organisations", rarity:"rare", prompt:"L'organisation te propose un combat pour la ceinture intérimaire, le champion titulaire étant blessé.",
    cond:(s)=> !!s.contract && (s.reputation||0) >= 50,
    choices:[
      { label:"Accepter de te battre pour cette ceinture intérimaire", effect:(s)=>{
          const win = Math.random() < 0.5;
          return win
            ? { d:{ titles:1, titleWonOrgName: s.contract ? s.contract.orgName : "Organisation", titleHolderOrgId: s.contract ? s.contract.orgId : null,
                reputation:9, hype:12, moral:6 },
                result:"Ceinture intérimaire remportée — en attendant l'unification face au champion titulaire de retour de blessure." }
            : { d:{ reputation:-5, moral:-5 }, result:"L'occasion t'échappe — la ceinture intérimaire ira à quelqu'un d'autre." };
        } },
      { label:"Attendre le retour du vrai champion", effect:()=>({d:{moral:2}, result:"Tu préfères viser directement le titre complet plutôt qu'une ceinture intérimaire." }) },
    ]},
  { cat:"Organisations", rarity:"rare", prompt:"Une défense de titre à l'étranger t'est proposée pour développer ta popularité dans une nouvelle région du monde.",
    cond:(s)=> (s.titleHolderOrgs||[]).length > 0,
    choices:[
      { label:"Accepter cette défense à l'étranger", effect:()=>({d:{ hype:9, reputation:4, money:rand(8000,25000),
          addPersistent:{ id:"expansion_internationale", label:"Popularité internationale en expansion", icon:"🌐", type:"buff", effects:{ hypeBonus:1 }, weeksLeft: 12 } },
          result:"Ta ceinture voyage et ta popularité grandit dans une région qui te découvre à peine." }) },
      { label:"Préférer défendre ton titre sur un terrain familier", effect:()=>({d:{moral:2}, result:"Tu choisis la prudence plutôt que l'aventure à l'étranger." }) },
    ]},

];

// ---------- COMPONENT ----------

export default function MMACareer(){
  const [phase, setPhase] = useState("intro");
  const [name, setName] = useState("");
  const [gender, setGender] = useState("homme");
  const [state, setState] = useState(null);
  const [options, setOptions] = useState([]);
  const [log, setLog] = useState([]);
  // ---- Un seul panneau "secondaire" ouvert à la fois sur l'écran principal ----
  // (négociation, camp, staff, coach, catégorie de poids, techniques, liste des combats) :
  // ouvrir l'un ferme automatiquement les autres, pour éviter que plusieurs panneaux
  // ne restent affichés en même temps et ne rendent l'écran illisible.
  const [activePanel, setActivePanel] = useState(null);
  // ---- Correspondance panneau → onglet, pour que l'onglet correspondant se sélectionne
  // automatiquement même quand le panneau est ouvert depuis un autre endroit de l'écran. ----
  const PANEL_TAB_MAP = { negotiate:"combats", worldmap:"combats", weightclass:"combats",
    gym:"entrainement", camps:"entrainement", techniques:"entrainement",
    coach:"equipe", staff:"equipe", social:"communication", investments:"finances", objectives:"objectifs" };
  function openPanel(p){ setActivePanel(p); if (PANEL_TAB_MAP[p]) setMenuTab(PANEL_TAB_MAP[p]); }
  function closePanel(){ setActivePanel(null); }
  // ---- Onglet actif du menu principal (Combats / Entraînement / Équipe / Communication) ----
  const [menuTab, setMenuTab] = useState("combats");
  // ---- Hall of Fame : les combattants retraités marquants sont sauvegardés d'une carrière à
  // l'autre (stockage persistant), pour pouvoir un jour affronter tes anciennes légendes. ----
  const [hallOfFame, setHallOfFame] = useState([]);
  const [hofSaved, setHofSaved] = useState(false);
  useEffect(()=>{
    let cancelled = false;
    async function loadHof(){
      try {
        if (!window.storage) return;
        const res = await window.storage.get("hall-of-fame", false);
        if (!cancelled && res && res.value){
          const parsed = JSON.parse(res.value);
          if (Array.isArray(parsed)) setHallOfFame(parsed);
        }
      } catch (e) { /* pas encore de Hall of Fame sauvegardé, ce n'est pas une erreur bloquante */ }
    }
    loadHof();
    return ()=>{ cancelled = true; };
  }, []);
  // ---- Rosters personnalisés (vrais combattants importés par organisation) : chargés une fois
  // au démarrage depuis window.storage, et réutilisés à chaque nouvelle carrière. ----
  const [customRosters, setCustomRosters] = useState({});
  const [rosterText, setRosterText] = useState("");
  const [rosterImportMsg, setRosterImportMsg] = useState("");
  const [showRosterPanel, setShowRosterPanel] = useState(false);
  useEffect(()=>{
    let cancelled = false;
    async function loadRosters(){
      try {
        if (!window.storage) return;
        const res = await window.storage.get("custom-rosters", false);
        if (!cancelled && res && res.value){
          const parsed = JSON.parse(res.value);
          if (parsed && typeof parsed === "object") setCustomRosters(parsed);
        }
      } catch (e) { /* pas encore de roster sauvegardé, ce n'est pas une erreur bloquante */ }
    }
    loadRosters();
    return ()=>{ cancelled = true; };
  }, []);
  function importRosterText(text){
    const parsed = parseRosterInput(text);
    const orgCount = Object.keys(parsed).length;
    if (!orgCount){
      setRosterImportMsg("Aucune organisation reconnue dans ce texte. Vérifie le format (voir l'exemple ci-dessus).");
      return;
    }
    setCustomRosters(prev=>{
      const merged = { ...prev };
      Object.keys(parsed).forEach(id=>{
        merged[id] = Array.from(new Set([...(merged[id]||[]), ...parsed[id]]));
      });
      try { window.storage && window.storage.set("custom-rosters", JSON.stringify(merged), false); } catch(e){}
      return merged;
    });
    const fighterCount = Object.values(parsed).reduce((t,arr)=>t+arr.length,0);
    setRosterImportMsg(`✅ ${fighterCount} combattant(s) importé(s) pour ${orgCount} organisation(s).`);
    setRosterText("");
  }
  function clearRosters(){
    setCustomRosters({});
    try { window.storage && window.storage.delete("custom-rosters", false); } catch(e){}
    setRosterImportMsg("Liste effacée.");
  }
  function handleRosterFile(e){
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ()=> importRosterText(String(reader.result||""));
    reader.readAsText(file);
    e.target.value = "";
  }
  useEffect(()=>{
    async function saveRetiree(){
      if (phase !== "gameover" || !state || hofSaved) return;
      try {
        if (!window.storage) return;
        const legacy = computeLegacyScore(state);
        const entry = {
          name, age: state.age, wins: state.wins, losses: state.losses, titles: state.titles,
          titlesWonOrgs: state.titlesWonOrgs||[], legacyScore: legacy.legacy100, tier: legacy.tier,
          longestWinStreak: state.longestWinStreak||0, finishes: legacy.finishes,
          skillSnapshot: Math.round(overallSkill(state)),
          // ---- Snapshot complet (état final + journal) pour pouvoir réafficher la carte de fin
          // exacte de cette carrière depuis l'écran d'accueil, même après avoir quitté la page. ----
          retiredAt: Date.now(),
          fullState: state,
          fullLog: (log||[]).slice(-150),
        };
        const updated = [entry, ...hallOfFame].slice(0, 25);
        await window.storage.set("hall-of-fame", JSON.stringify(updated), false);
        setHallOfFame(updated);
        setHofSaved(true);
      } catch (e) { /* la sauvegarde du Hall of Fame est un bonus, jamais bloquant */ }
    }
    saveRetiree();
  }, [phase, state, hofSaved, hallOfFame, name]);
  const [pendingEvent, setPendingEvent] = useState(null);
  const [pendingFeud, setPendingFeud] = useState(null);
  const [pendingContract, setPendingContract] = useState(null);
  const [pendingFight, setPendingFight] = useState(null);
  const [pendingMoment, setPendingMoment] = useState(null);
  const [pendingCoachContext, setPendingCoachContext] = useState(null);
  const [pendingStyle, setPendingStyle] = useState(null);
  const [pendingTrashtalk, setPendingTrashtalk] = useState(null);
  const [pendingActions, setPendingActions] = useState([]);
  const [pendingFightResult, setPendingFightResult] = useState(null);
  const [pendingIncident, setPendingIncident] = useState(null);
  const [pendingPostPresser, setPendingPostPresser] = useState(null);
  const [pendingPostFightChain, setPendingPostFightChain] = useState(null);
  const [coachCareer, setCoachCareer] = useState(null);

  // ---- Horloge de vie partagée par les 3 reconversions : vieillissement, santé qui décline,
  // et mort possible à l'ancienneté — avec un plafond absolu et certain à 100 ans. Au-delà de
  // 84 ans, une chance de décès prématuré s'ajoute chaque saison en plus du plafond. ----
  function reconversionAgeStep(age, health){
    const newAge = age + 1;
    let decline = 1 + Math.random()*2.5;
    if (age >= 70) decline += (age-69)*0.18;
    if (age >= 85) decline += (age-84)*0.3;
    const newHealth = clamp(Math.round(health - decline), 0, 100);
    let deathChance = 0;
    if (age >= 85) deathChance += (age-84)*0.02;
    if (newHealth <= 20) deathChance += 0.12;
    if (newHealth <= 8) deathChance += 0.3;
    const forced = newAge >= 100;
    const died = forced || Math.random() < deathChance;
    return { newAge, newHealth, died, forced };
  }
  // ---- Épilogue de fin de vie : déclenché depuis n'importe laquelle des 3 reconversions
  // quand l'horloge de vie ci-dessus annonce un décès. Regroupe le bilan du combattant et
  // celui de sa reconversion pour un dernier écran de récapitulatif. ----
  const [epilogue, setEpilogue] = useState(null);
  function triggerReconversionEpilogue(type, career){
    setEpilogue({ type, age: career.age, cause: career.age>=100 ? "grand-age" : "sante", stats: career });
    setPhase("epilogue");
  }

  // ---- Carrière d'entraîneur : gérer une salle (budget, réputation, niveau d'installations),
  // choisir chaque saison un axe tactique (technique / recrutement / business) avec ses propres
  // compromis, risquer la blessure ou le débauchage de ses prospects, et faire face à un vrai
  // risque de faillite si le budget plonge trop bas. ----
  function startCoachingCareer(){
    const gymName = `Salle ${name}`;
    setCoachCareer({
      gymName, season: 1,
      age: (state && state.age) || 35, health: clamp(Math.round((state && state.health) ?? 80), 50, 100),
      budget: 12000, reputation: clamp(20 + Math.round((state?.titles||0)*8 + (state?.wins||0)*0.5), 10, 60),
      facilityLevel: 1, bankrupt: false,
      prospects: [], fightersTrained: 0, championsProduced: 0, ufcSignings: 0,
      log: [`🏋️ ${name} raccroche les gants et ouvre ${gymName}, bien décidé(e) à former la nouvelle génération.`],
    });
    setPhase("coaching");
  }
  function upgradeGymFacility(){
    const cc = coachCareer;
    if (!cc || cc.bankrupt || cc.facilityLevel >= 3) return;
    const cost = 10000 * cc.facilityLevel;
    if (cc.budget < cost) return;
    let log = [`🏗️ ${cc.gymName} agrandit ses installations (niveau ${cc.facilityLevel+1}) pour ${eur(cost)}.`, ...cc.log];
    if (log.length > 45) log = log.slice(0,45);
    setCoachCareer({ ...cc, budget: cc.budget - cost, facilityLevel: cc.facilityLevel+1, log });
  }
  function advanceCoachingSeason(focus){
    const cc = coachCareer;
    if (!cc || cc.bankrupt) return;
    let log = [...cc.log];
    let prospects = cc.prospects.map(p=>({ ...p }));
    let championsProduced = cc.championsProduced;
    let ufcSignings = cc.ufcSignings||0;
    let budget = cc.budget;
    let reputation = cc.reputation;

    // ---- Coûts fixes de la saison (loyer, staff), qui augmentent avec le niveau de la salle ----
    budget -= 900 + cc.facilityLevel*450;

    const isTechnique = focus === "technique";
    const isScouting = focus === "scouting";
    const isBusiness = focus === "business";

    const recruitChance = 0.32 + (isScouting?0.22:0) + reputation*0.002;
    if (prospects.length < 7 && Math.random() < recruitChance){
      const pName = randName(gender);
      const potential = isScouting ? randInt(2,3) : randInt(1,3);
      prospects.push({ name: pName, wins:0, losses:0, potential, signed:false, retired:false, injured:false });
      log.unshift(`🤝 Un jeune prometteur (${"⭐".repeat(potential)}), ${pName}, rejoint ${cc.gymName}.`);
    }

    prospects = prospects.map(p=>{
      if (p.retired) return p;
      const p2 = { ...p };
      if (p2.injured){
        log.unshift(`🩹 ${p2.name} reste au repos pour soigner sa blessure.`);
        p2.injured = false;
        return p2;
      }
      let winChance = 0.42 + p2.potential*0.06 + cc.facilityLevel*0.03 + reputation*0.0015;
      if (isTechnique) winChance += 0.09;
      if (isBusiness) winChance -= 0.05;
      winChance = clamp(winChance, 0.15, 0.85);
      const injuryChance = clamp(0.09 - (isTechnique?0.035:0) + (isBusiness?0.03:0), 0.02, 0.25);

      if (Math.random() < injuryChance){
        p2.injured = true;
        log.unshift(`⚠️ ${p2.name} se blesse à l'entraînement — repos forcé la saison prochaine.`);
        return p2;
      }

      if (Math.random() < winChance){
        p2.wins += 1;
        if (p2.signed){
          const purse = Math.round(rand(2000,9000) * (1 + cc.facilityLevel*0.2));
          const cut = Math.round(purse * 0.12);
          budget += cut;
          log.unshift(`💰 ${p2.name} l'emporte et te reverse ${eur(cut)} sur son cachet (${eur(purse)}).`);
        }
        if (!p2.signed && p2.wins>=3){
          if (Math.random() < clamp(0.3 + (isScouting?0.15:0) + reputation*0.004, 0.1, 0.9)){
            p2.signed = true;
            ufcSignings += 1;
            reputation = clamp(reputation+4, 0, 100);
            log.unshift(`✍️ ${p2.name}, formé(e) à ${cc.gymName}, signe un contrat dans une grande organisation.`);
          }
        } else if (p2.signed && p2.wins>=6 && Math.random() < clamp(0.22+reputation*0.002, 0.1, 0.6)){
          championsProduced += 1;
          reputation = clamp(reputation+9, 0, 100);
          p2.retired = true;
          log.unshift(`🏆 ${p2.name} devient champion(ne) — ton travail de coach porte enfin ses fruits !`);
        }
        if (p2.signed && !p2.retired && p2.wins>=4 && Math.random() < clamp(0.12 - reputation*0.001, 0.02, 0.12)){
          log.unshift(`🕵️ Une salle rivale débauche ${p2.name} à coups de gros chèques — tu le/la perds.`);
          reputation = clamp(reputation-3, 0, 100);
          p2.retired = true;
        }
      } else {
        p2.losses += 1;
        if (Math.random() < 0.16){
          p2.retired = true;
          log.unshift(`👋 ${p2.name} quitte la compétition, sa carrière s'arrête là.`);
        }
      }
      return p2;
    });

    if (isBusiness){
      const sponsorIncome = Math.round(rand(1500,6000) + reputation*35);
      budget += sponsorIncome;
      reputation = clamp(reputation+2, 0, 100);
      log.unshift(`📣 Campagne de sponsoring pour ${cc.gymName} : +${eur(sponsorIncome)} de revenus additionnels.`);
    }

    const bankrupt = budget < -15000;
    if (bankrupt) log.unshift(`💥 ${cc.gymName} met la clé sous la porte, incapable de rembourser ses dettes — fin de ta carrière d'entraîneur.`);

    if (log.length > 45) log = log.slice(0,45);

    const clock = reconversionAgeStep(cc.age, cc.health);
    const age = clock.newAge, health = clock.newHealth;
    if (clock.died){
      log.unshift(clock.forced
        ? `🕯️ À ${age} ans, ${name} s'éteint paisiblement, entouré(e) des combattants qu'il/elle aura formés.`
        : `🕯️ À ${age} ans, la santé de ${name} finit par lâcher — il/elle s'éteint entouré(e) des siens.`);
    }

    const updated = { ...cc, season: cc.season+1, age, health, budget, reputation,
      prospects, fightersTrained: prospects.length, championsProduced, ufcSignings, bankrupt, log };
    setCoachCareer(updated);
    if (clock.died) triggerReconversionEpilogue("coach", updated);
  }

  // ---- Reconversion : Promoteur — organiser des galas de tailles différentes (petit gala sûr,
  // grand PPV risqué, soirée à thème), négocier des deals TV qui font grimper les recettes, gérer
  // un vrai budget qui peut plonger dans le rouge jusqu'à la faillite. ----
  const [promoterCareer, setPromoterCareer] = useState(null);
  function startPromoterCareer(){
    setPromoterCareer({
      company: `${name} Promotions`, season: 1,
      age: (state && state.age) || 35, health: clamp(Math.round((state && state.health) ?? 80), 50, 100),
      budget: 20000, reputation: clamp(20 + Math.round((state?.titles||0)*8 + (state?.wins||0)*0.5), 10, 60),
      tvDealLevel: 0, cardsRun: 0, bigNamesSigned: 0, bankrupt: false,
      log: [`🎪 ${name} raccroche les gants et fonde ${name} Promotions, bien décidé(e) à monter des galas mémorables.`],
    });
    setPhase("promoting");
  }
  function negotiateTvDeal(){
    const pc = promoterCareer;
    if (!pc || pc.bankrupt || pc.tvDealLevel >= 3) return;
    const fee = 8000 * (pc.tvDealLevel+1);
    if (pc.budget < fee) return;
    const labels = ["locale","régionale","nationale","internationale"];
    let log = [...pc.log];
    let budget = pc.budget - fee;
    let tvDealLevel = pc.tvDealLevel;
    let reputation = pc.reputation;
    if (Math.random() < clamp(0.3 + reputation*0.006, 0.1, 0.85)){
      tvDealLevel += 1;
      reputation = clamp(reputation+5,0,100);
      log.unshift(`📺 Nouveau deal TV décroché : diffusion ${labels[tvDealLevel]} pour ${pc.company} !`);
    } else {
      log.unshift(`❌ La négociation du deal TV échoue — les ${eur(fee)} de frais sont perdus.`);
    }
    if (log.length>45) log = log.slice(0,45);
    setPromoterCareer({ ...pc, budget, tvDealLevel, reputation, log });
  }
  function advancePromoterSeason(scale){
    const pc = promoterCareer;
    if (!pc || pc.bankrupt) return;
    let log = [...pc.log];
    let budget = pc.budget;
    let reputation = pc.reputation;
    let cardsRun = pc.cardsRun + 1;
    let bigNamesSigned = pc.bigNamesSigned;

    const scaleData = {
      small: { cost: rand(3000,8000), riskMult:0.6, revMult:0.7, label:"Gala régional" },
      ppv:   { cost: rand(20000,45000), riskMult:1.6, revMult:1.9, label:"Gala PPV majeur" },
      theme: { cost: rand(9000,18000), riskMult:1.1, revMult:1.1, label:"Soirée à thème" },
    }[scale] || { cost: rand(8000,15000), riskMult:1, revMult:1, label:"Gala" };

    const cost = Math.round(scaleData.cost);
    budget -= cost;

    const tvMult = 1 + pc.tvDealLevel*0.5;
    const repMult = 1 + reputation*0.01;
    const gala = Math.round(rand(8000,30000) * scaleData.revMult * tvMult * repMult * (1 + bigNamesSigned*0.08));
    budget += gala;
    log.unshift(`🎟️ ${scaleData.label} n°${cardsRun} organisé : ${eur(gala)} de recette (coût ${eur(cost)}).`);

    if (Math.random() < clamp(0.05*scaleData.riskMult - reputation*0.0015, 0.01, 0.3)){
      const loss = Math.round(rand(3000,15000)*scaleData.riskMult);
      budget -= loss;
      reputation = clamp(reputation-6,0,100);
      log.unshift(`⚠️ ${scaleData.label} tourne au fiasco logistique — ${eur(loss)} de pertes et image écornée.`);
    }

    if (Math.random() < clamp(0.22 + reputation*0.003 + pc.tvDealLevel*0.05, 0.05, 0.6)){
      const fighterName = randName();
      if (Math.random() < clamp(0.3 - reputation*0.003, 0.05, 0.3)){
        log.unshift(`🥊 ${fighterName} négocie avec ${pc.company}... avant de signer chez un promoteur concurrent.`);
      } else {
        bigNamesSigned += 1;
        const signBonus = Math.round(rand(2000,10000));
        budget -= signBonus;
        log.unshift(`✍️ ${pc.company} signe ${fighterName}, une tête d'affiche, pour ${eur(signBonus)} de prime à la signature.`);
      }
    }

    const bankrupt = budget < -50000;
    if (bankrupt) log.unshift(`💥 ${pc.company} dépose le bilan, écrasé(e) par les dettes — fin de ta carrière de promoteur.`);

    if (log.length>45) log = log.slice(0,45);

    const clock = reconversionAgeStep(pc.age, pc.health);
    const age = clock.newAge, health = clock.newHealth;
    if (clock.died){
      log.unshift(clock.forced
        ? `🕯️ À ${age} ans, ${name} s'éteint paisiblement, après une vie passée à faire vivre le sport qu'il/elle aimait.`
        : `🕯️ À ${age} ans, la santé de ${name} finit par lâcher — il/elle s'éteint entouré(e) des siens.`);
    }

    const updated = { ...pc, season: pc.season+1, age, health, budget, reputation, cardsRun, bigNamesSigned, bankrupt, log };
    setPromoterCareer(updated);
    if (clock.died) triggerReconversionEpilogue("promoter", updated);
  }

  // ---- Reconversion : Commentateur — choisir un style de commentaire à chaque grand cartel
  // (analyse technique posée, show et hype, ou prise de position clivante), construire sa
  // crédibilité pour monter en gamme de diffuseur, jusqu'au risque de se faire virer d'antenne
  // en cas de trop de polémiques. ----
  const [commentatorCareer, setCommentatorCareer] = useState(null);
  function startCommentatorCareer(){
    setCommentatorCareer({
      season: 1,
      age: (state && state.age) || 35, health: clamp(Math.round((state && state.health) ?? 80), 50, 100),
      audience: 1000, credibility: 30, networkLevel: 0,
      viralMoments: 0, controversies: 0, bankrupt: false,
      log: [`🎙️ ${name} raccroche les gants et prend le micro pour commenter les grands cartels.`],
    });
    setPhase("commentating");
  }
  function advanceCommentatorSeason(style){
    const kc = commentatorCareer;
    if (!kc || kc.bankrupt) return;
    let log = [...kc.log];
    let audience = kc.audience;
    let credibility = kc.credibility;
    let viralMoments = kc.viralMoments;
    let controversies = kc.controversies;
    let networkLevel = kc.networkLevel;
    const networkMult = [1, 1.3, 1.7, 2.3][networkLevel] || 1;

    if (style === "technique"){
      const gain = Math.round(audience * rand(0.03,0.12) * networkMult);
      audience += gain;
      credibility = clamp(credibility + rand(2,5), 0, 100);
      log.unshift(`🧠 Analyse technique pointue du dernier cartel : +${gain} auditeurs, crédibilité en hausse.`);
      if (Math.random() < 0.08){
        viralMoments += 1;
        const viralGain = Math.round(audience*rand(0.1,0.2));
        audience += viralGain;
        log.unshift(`📊 Une analyse d'avant-combat se révèle prophétique et devient virale : +${viralGain} auditeurs.`);
      }
    } else if (style === "hype"){
      const gain = Math.round(audience * rand(0.08,0.25) * networkMult);
      audience += gain;
      credibility = clamp(credibility - rand(0,2), 0, 100);
      log.unshift(`🔥 Commentaire show et énergique : +${gain} auditeurs !`);
      if (Math.random() < 0.18){
        controversies += 1;
        credibility = clamp(credibility-4,0,100);
        log.unshift(`😬 L'emphase permanente agace une partie du public — polémique.`);
        audience = Math.round(audience*0.94);
      }
    } else {
      const roll = Math.random();
      if (roll < 0.35){
        viralMoments += 1;
        const viralGain = Math.round(audience*rand(0.3,0.6));
        audience += viralGain;
        credibility = clamp(credibility+rand(1,4),0,100);
        log.unshift(`💥 Une prise de position tranchée fait l'effet d'une bombe — +${viralGain} auditeurs !`);
      } else if (roll < 0.7){
        controversies += 1;
        credibility = clamp(credibility-rand(6,14),0,100);
        audience = Math.round(audience*rand(0.82,0.95));
        log.unshift(`😡 La prise de position tourne au bad buzz — audience et crédibilité en chute.`);
      } else {
        const gain = Math.round(audience*rand(0.05,0.15));
        audience += gain;
        log.unshift(`🗣️ Prise de position remarquée sans excès : +${gain} auditeurs.`);
      }
    }

    const fired = credibility <= 8 && controversies >= 4;
    if (fired) log.unshift(`📴 La chaîne met fin à ta collaboration après une nouvelle polémique — fin de ta carrière de commentateur.`);

    const tiers = [0, 35, 60, 85];
    if (!fired && networkLevel < 3 && credibility >= tiers[networkLevel+1]){
      networkLevel += 1;
      const labels = ["indépendant","régional","national","international"];
      log.unshift(`📡 Ta crédibilité te vaut un contrat de diffuseur ${labels[networkLevel]} !`);
    }

    if (log.length>45) log = log.slice(0,45);

    const clock = reconversionAgeStep(kc.age, kc.health);
    const age = clock.newAge, health = clock.newHealth;
    if (clock.died){
      log.unshift(clock.forced
        ? `🕯️ À ${age} ans, ${name} s'éteint paisiblement, micro à jamais posé après une vie dédiée au sport.`
        : `🕯️ À ${age} ans, la santé de ${name} finit par lâcher — il/elle s'éteint entouré(e) des siens.`);
    }

    const updated = { ...kc, season: kc.season+1, age, health, audience, credibility, viralMoments, controversies, networkLevel, bankrupt: fired, log };
    setCommentatorCareer(updated);
    if (clock.died) triggerReconversionEpilogue("commentator", updated);
  }
  const [levelUpToast, setLevelUpToast] = useState([]);

  // ---- Sauvegarde de la partie en cours : permet de reprendre exactement là où on en était
  // après un rafraîchissement de la page, plutôt que de repartir de zéro à chaque fois. ----
  const [pendingSave, setPendingSave] = useState(null);
  const [saveChecked, setSaveChecked] = useState(false);
  // ---- Quand on consulte la carte de fin d'une ancienne carrière archivée (Hall of Fame),
  // on ne doit pas écraser la vraie sauvegarde en cours avec cette carrière déjà terminée. ----
  const [viewingArchive, setViewingArchive] = useState(false);

  useEffect(()=>{
    let cancelled = false;
    async function loadSave(){
      try {
        if (window.storage){
          const res = await window.storage.get("current-save", false);
          if (!cancelled && res && res.value){
            const parsed = JSON.parse(res.value);
            if (parsed && parsed.state) setPendingSave(parsed);
          }
        }
      } catch (e) { /* pas de partie en cours sauvegardée, ce n'est pas bloquant */ }
      if (!cancelled) setSaveChecked(true);
    }
    loadSave();
    return ()=>{ cancelled = true; };
  }, []);

  useEffect(()=>{
    async function persist(){
      try {
        if (!window.storage || viewingArchive || !saveChecked) return;
        if (phase === "intro" && !state){
          await window.storage.delete("current-save", false);
          return;
        }
        const snapshot = {
          phase, name, gender, state, options, log, activePanel, menuTab,
          pendingEvent, pendingFeud, pendingContract, pendingFight, pendingMoment,
          pendingCoachContext, pendingStyle, pendingTrashtalk, pendingActions,
          pendingFightResult, pendingIncident, pendingPostPresser, pendingPostFightChain,
          coachCareer, promoterCareer, commentatorCareer, hofSaved, epilogue,
          savedAt: Date.now(),
        };
        await window.storage.set("current-save", JSON.stringify(snapshot), false);
      } catch (e) { /* la sauvegarde de la partie en cours est un bonus, jamais bloquant */ }
    }
    persist();
  }, [phase, name, gender, state, options, log, activePanel, menuTab,
      pendingEvent, pendingFeud, pendingContract, pendingFight, pendingMoment,
      pendingCoachContext, pendingStyle, pendingTrashtalk, pendingActions,
      pendingFightResult, pendingIncident, pendingPostPresser, pendingPostFightChain,
      coachCareer, promoterCareer, commentatorCareer, hofSaved, epilogue, viewingArchive, saveChecked]);

  function resumeSave(){
    const p = pendingSave;
    if (!p) return;
    setViewingArchive(false);
    setPhase(p.phase || "intro"); setName(p.name || ""); setGender(p.gender || "homme");
    setState(p.state || null); setOptions(p.options || []); setLog(p.log || []);
    setActivePanel(p.activePanel || null); setMenuTab(p.menuTab || "combats");
    setPendingEvent(p.pendingEvent || null); setPendingFeud(p.pendingFeud || null);
    setPendingContract(p.pendingContract || null); setPendingFight(p.pendingFight || null);
    setPendingMoment(p.pendingMoment || null); setPendingCoachContext(p.pendingCoachContext || null);
    setPendingStyle(p.pendingStyle || null); setPendingTrashtalk(p.pendingTrashtalk || null);
    setPendingActions(p.pendingActions || []); setPendingFightResult(p.pendingFightResult || null);
    setPendingIncident(p.pendingIncident || null); setPendingPostPresser(p.pendingPostPresser || null);
    setPendingPostFightChain(p.pendingPostFightChain || null);
    setCoachCareer(p.coachCareer || null); setPromoterCareer(p.promoterCareer || null);
    setCommentatorCareer(p.commentatorCareer || null); setHofSaved(!!p.hofSaved);
    setEpilogue(p.epilogue || null);
    setPendingSave(null);
  }

  function discardSave(){
    setPendingSave(null);
    try { window.storage && window.storage.delete("current-save", false); } catch(e){}
  }

  // ---- Ouvre en lecture seule la carte de fin d'une ancienne carrière du Hall of Fame,
  // sans toucher à la sauvegarde de la partie en cours. ----
  function viewArchivedEntry(entry){
    if (!entry || !entry.fullState) return;
    setViewingArchive(true);
    setName(entry.name || "");
    setState(entry.fullState);
    setLog(entry.fullLog || []);
    setHofSaved(true);
    setPhase("gameover");
  }

  function backToIntroFromArchive(){
    setViewingArchive(false);
    setPhase("intro"); setName(""); setState(null); setLog([]); setHofSaved(false);
  }

  function triggerLevelUpToast(items){
    if (!items || !items.length) return;
    const batchId = Math.random().toString(36).slice(2,8);
    const withId = items.map(it=>({ ...it, _id: batchId+"-"+it.key }));
    setLevelUpToast(t => [...t, ...withId]);
    setTimeout(()=>{
      setLevelUpToast(t => t.filter(x => !withId.some(w=>w._id===x._id)));
    }, 3200);
  }

  function generateRandomName(){ setName(randName(gender)); }

  function startCareer(style, weightClass){
    if(!name.trim()) return;
    const wc = weightClass || WEIGHT_CLASSES[4];
    const s = {
      age: 18, gender,
      boxe: rand(...style.boxe), grappling: rand(...style.grappling), lutte: rand(...style.lutte),
      cardio: rand(...style.cardio), mental: rand(...style.mental), chin: rand(...style.chin), aura: 8,
      styleName: style.name, styleId: style.id,
      weightClassId: wc.id,
      reputation: 0, money: 0, dette: 0,
      health: 100, moral: 70, energie: 100, coachRelation: 60,
      wins: 0, losses: 0, titles: 0, fights: 0,
      // Semaine à partir de laquelle un nouveau combat officiel peut être proposé : impossible
      // de combattre chaque semaine, il faut un vrai camp d'entraînement / une vraie récupération
      // entre deux combats (voir generateFightTurn / resolveFight).
      nextFightWeek: 0,
      lastFight: null,
      gymId: "quartier", injuredTurns: 0,
      contract: null, dwcsAttempts: 0, hasHadUFCContract: false,
      recentEventIds: [],
      contractWins: 0, contractFightsTotal: 0, contractWinRateLast: 0, justEndedContractOrg: null,
      hasAgent: false, agentCut: 0.12,
      discoveredTechniques: [],
      techPoints: 0,
      mentalFatigue: 0,
      weeklyLoad: 0,
      hype: 20,
      discoveredStaff: [],
      hiredStaff: [],
      headCoachId: "coach_debutant",
      lossStreak: 0,
      pendingCoachDecision: false,
      year: 2026, week: 1, totalWeeks: 1,
      campsDone: [],
      recentTactics: [],
      // ---- Statistiques de fin de carrière (fiche complète) ----
      koWins:0, tkoWins:0, subWins:0, decWins:0,
      koLosses:0, tkoLosses:0, subLosses:0, decLosses:0,
      biggestPurse: 0,
      winStreak: 0, longestWinStreak: 0, longestLossStreak: 0,
      weeksInjuredTotal: 0, injuryCount: 0, severeInjuryCount: 0,
      weeksTrained: 0,
      countriesVisited: [],
      titlesWonOrgs: [],
      objectivesCompleted: [],
      recordsBroken: [],
      totalEarnings: 0, totalTravelSpent: 0, totalStaffSpent: 0, totalTaxesPaid: 0, totalEquipmentSpent: 0,
      followers: 0, socialControversy: 0, socialPostsThisWeek: 0, countryPopularity: {}, popularityMilestones: {},
      relationshipStatus: "célibataire", children: 0, familyWeeklyCost: 0,
      fightsOfTheYear: 0,
      sponsorWeekly: 0, sponsorWeeksLeft: 0,
      persistentStates: [],
      // ancien système d'objectifs personnels de saison retiré
      // ---- Nouveaux systèmes ----
      titleHolderOrgs: [], titleDefenses: 0,
      rivals: [],
      localizedInjuries: [],
      orgRanks: {}, rankings: {},
      globalRank: null, globalRanking: initGlobalRanking(gender),
      sponsorDeals: [],
      investments: [], totalPassiveIncome: 0, pendingBadBoyOffer: null, badBoySponsorActive: false, badBoyOfferSeen: false,
      trainingPartners: initialTrainingPartners(),
      legendWins: 0,
    };
    // ---- Héritage : si le Hall of Fame contient déjà d'anciennes légendes retraitées, la nouvelle
    // carrière démarre dans leur ombre — les vieux fans se souviennent, et ça aide un peu au début. ----
    let legacyLine = null;
    if (hallOfFame.length){
      const best = [...hallOfFame].sort((a,b)=>b.legacyScore-a.legacyScore)[0];
      const bonus = clamp(Math.round(best.legacyScore*0.08), 2, 10);
      s.reputation = clamp(s.reputation + bonus, 0, 100);
      s.hype = clamp(s.hype + bonus, 0, 100);
      s.legacyOf = best.name;
      legacyLine = `🐐 Les vieux fans se souviennent encore de ${best.name} (${best.tier}) — tu débutes avec un peu de leur aura (+${bonus} réputation, +${bonus} hype).`;
    }
    setState(s);
    setLog([`${name} débute sa carrière à 18 ans (style : ${style.name}, catégorie : ${wc.name}), loin des projecteurs.`, ...(legacyLine?[legacyLine]:[])]);
    setPhase("career");
    advance(s);
  }

  function currentGym(s){ return GYMS.find(g=>g.id===s.gymId); }
  function coachFactor(s){
    const hc = headCoachById(s.headCoachId);
    return (0.7 + (s.coachRelation/100)*0.6) * (hc.skillMult||1);
  }
  // ---- Calendrier hebdomadaire : chaque cycle avance d'un nombre entier de semaines ----
  // Une saison dure 52 semaines ; les organisations proposent des cartes chaque semaine,
  // donc chaque décision (combat ou repos) fait avancer la carrière semaine par semaine.
  function advanceCalendarWeeks(ns, weeks){
    const w = Math.max(1, Math.round(weeks));
    const prevTotalWeeks = ns.totalWeeks || (ns.week||1);
    let week = (ns.week||1) + w;
    let year = ns.year||2026;
    while (week > 52){ week -= 52; year += 1; }
    ns.week = week; ns.year = year;
    // ---- Compteur de semaines absolu, jamais réinitialisé par le passage à l'année suivante :
    // sert de référence pour la planification du prochain combat (nextFightWeek), car ns.week
    // repart à 1 chaque année et ne peut donc pas être comparé fiablement à une échéance fixée
    // avant le passage à la nouvelle saison (c'était la cause de la boucle infinie de camp). ----
    ns.totalWeeks = prevTotalWeeks + w;
    ns.age = +(ns.age + w/52).toFixed(2);
    ns = tickPersistentStates(ns, w);
    ns = tickLocalizedInjuries(ns, w);
    return ns;
  }
  function addSkillAll(ns, delta){
    const safeDelta = Number.isFinite(delta) ? delta : 0;
    ns.boxe = clamp((Number.isFinite(ns.boxe)?ns.boxe:40) + safeDelta, 0, 99);
    ns.grappling = clamp((Number.isFinite(ns.grappling)?ns.grappling:40) + safeDelta, 0, 99);
    ns.lutte = clamp((Number.isFinite(ns.lutte)?ns.lutte:40) + safeDelta, 0, 99);
  }
  function addSkillBiased(ns, base, focus){
    const safeBase = Number.isFinite(base) ? base : 0;
    ["boxe","grappling","lutte"].forEach(k=>{
      const mult = focus ? (k===focus ? 1.6 : 0.7) : 1;
      const current = Number.isFinite(ns[k]) ? ns[k] : 40;
      ns[k] = clamp(current + safeBase*mult, 0, 99);
    });
  }

  function applyDelta(ns, d){
    ns.money = ns.money + (d.money||0);
    if (d.skill) addSkillAll(ns, d.skill);
    if (d.skillFocus) addSkillBiased(ns, d.skillFocus.amount, d.skillFocus.discipline);
    ["health","reputation","moral","coachRelation","cardio","mental","chin","aura","hype","energie"].forEach(k=>{
      if (d[k]) ns[k] = clamp((ns[k]||0) + d[k], 0, 100);
    });
    if (d.dette) ns.dette = Math.max(0, (ns.dette||0) + d.dette);
    if (d.hasAgent !== undefined) ns.hasAgent = d.hasAgent;
    if (d.agentCut !== undefined) ns.agentCut = d.agentCut;
    if (d.discoverStaff && !(ns.discoveredStaff||[]).includes(d.discoverStaff)){
      ns.discoveredStaff = [...(ns.discoveredStaff||[]), d.discoverStaff];
    }
    if (d.techPoints) ns.techPoints = (ns.techPoints||0) + d.techPoints;
    // Une blessure issue d'un happening a un vrai impact : semaines de convalescence obligatoires,
    // exactement comme une blessure de combat (bloque les combats jusqu'à guérison).
    if (d.injuredTurns){
      ns.injuredTurns = Math.max(ns.injuredTurns||0, d.injuredTurns);
      ns.injuryCount = (ns.injuryCount||0) + 1;
      ns.weeksInjuredTotal = (ns.weeksInjuredTotal||0) + d.injuredTurns;
    }
    // Une crise contractuelle grave peut vraiment casser un contrat en cours.
    if (d.contractBreak) ns.contract = null;
    // Un sponsor longue durée verse un revenu chaque semaine pendant un nombre de semaines donné.
    if (d.sponsorWeekly){
      ns.sponsorWeekly = (ns.sponsorWeekly||0) + d.sponsorWeekly;
      ns.sponsorWeeksLeft = Math.max(ns.sponsorWeeksLeft||0, d.sponsorWeeks||20);
    }
    if (d.titles) ns.titles = Math.max(0, (ns.titles||0) + d.titles);
    // ---- Titre remporté directement via un happening (ex: ceinture intérimaire) : on met aussi
    // à jour les organisations où le titre a été gagné, pour que le Grand Chelem et les ceintures
    // simultanées restent cohérents avec les combats "classiques". ----
    if (d.titleWonOrgName) ns.titlesWonOrgs = [...(ns.titlesWonOrgs||[]), d.titleWonOrgName];
    if (d.titleHolderOrgId) ns.titleHolderOrgs = [...(ns.titleHolderOrgs||[]).filter(id=>id!==d.titleHolderOrgId), d.titleHolderOrgId];
    if (d.loseTitleHolderOrgId) ns.titleHolderOrgs = (ns.titleHolderOrgs||[]).filter(id=>id!==d.loseTitleHolderOrgId);
    // ---- États persistants issus des happenings (voir RARITY / persistentStates plus haut) ----
    if (d.addPersistent) ns = addPersistentState(ns, d.addPersistent);
    if (d.removePersistent) ns = removePersistentState(ns, d.removePersistent);
    if (d.removePersistentList && d.removePersistentList.length){
      d.removePersistentList.forEach(id => { ns = removePersistentState(ns, id); });
    }
    if (d.clearInjury){ ns.injuredTurns = 0; ns.localizedInjuries = []; }
    // ---- Blessure localisée (main cassée, genou, côte fissurée, arcade ouverte, etc.) ----
    if (d.localizedInjury){
      ns.localizedInjuries = [...(ns.localizedInjuries||[]).filter(li=>li.id!==d.localizedInjury.id), d.localizedInjury];
      ns.injuredTurns = Math.max(ns.injuredTurns||0, d.localizedInjury.weeksLeft||0);
      ns.injuryCount = (ns.injuryCount||0) + 1;
      ns.weeksInjuredTotal = (ns.weeksInjuredTotal||0) + (d.localizedInjury.weeksLeft||0);
    }
    if (d.randomLocalizedInjury){
      const li = rollLocalizedInjury();
      ns.localizedInjuries = [...(ns.localizedInjuries||[]).filter(x=>x.id!==li.id), li];
      ns.injuredTurns = Math.max(ns.injuredTurns||0, li.weeksLeft);
      ns.injuryCount = (ns.injuryCount||0) + 1;
      ns.weeksInjuredTotal = (ns.weeksInjuredTotal||0) + li.weeksLeft;
    }
    // ---- Nouveau sponsor à objectif ----
    if (d.addSponsorDeal) ns.sponsorDeals = [...(ns.sponsorDeals||[]).filter(sd=>sd.id!==d.addSponsorDeal.id), d.addSponsorDeal];
    if (d.removeSponsorDeal) ns.sponsorDeals = (ns.sponsorDeals||[]).filter(sd=>sd.id!==d.removeSponsorDeal);
    return ns;
  }

  function applyLivingCosts(ns){
    const gym = currentGym(ns);
    const staffCostMonthly = staffMonthlyCost(ns.hiredStaff) + headCoachById(ns.headCoachId).cost;
    // ---- Patrimoine : une salle de sport personnelle réduit le coût du staff et rapporte un
    // revenu passif hebdomadaire (cours donnés à des amateurs, licence du nom, etc.). ----
    const ownGym = hasInvestment(ns, "own_gym");
    const staffCost = Math.round((staffCostMonthly * (ownGym ? 0.75 : 1))/4.33); // ramené à un coût hebdomadaire
    const passiveIncome = ownGym ? randInt(...investmentById("own_gym").incomeRange) : 0;
    // ---- Matériel : gants, protège-dents, bandages, kinésio-tape... usure hebdomadaire de base,
    // avec un renouvellement plus lourd (nouveaux gants, protections) environ une fois tous les dix
    // à quinze rounds passés en salle. ----
    let equipmentCost = 8;
    let equipmentNote = null;
    if (Math.random() < 0.08){
      const bigCost = randInt(120, 380);
      equipmentCost += bigCost;
      equipmentNote = `🥊 Renouvellement de matériel (gants, protections, bandages) : ${eur(bigCost)}.`;
    }
    let cost = Math.round((280 + gym.cost*0.005 + ns.age*3)/4.33 + staffCost + equipmentCost + (ns.familyWeeklyCost||0)) - passiveIncome;
    if (ns.sponsorWeekly && ns.sponsorWeeksLeft>0){
      cost -= ns.sponsorWeekly;
      ns.sponsorWeeksLeft -= 1;
      if (ns.badBoySponsorActive){
        ns.socialControversy = clamp((ns.socialControversy||0) + rand(1,4), 0, 100);
      }
      if (ns.sponsorWeeksLeft<=0){ ns.sponsorWeekly = 0; ns.sponsorWeeksLeft = 0; ns.badBoySponsorActive = false; }
    }
    let debtIncurred = false;
    ns.money -= cost;
    ns.totalStaffSpent = (ns.totalStaffSpent||0) + staffCost;
    ns.totalEquipmentSpent = (ns.totalEquipmentSpent||0) + equipmentCost;
    if (ownGym) ns.totalPassiveIncome = (ns.totalPassiveIncome||0) + passiveIncome;
    if (ns.dette > 0) ns.dette = Math.round(ns.dette*1.008);
    if (ns.money < 0){
      ns.dette = Math.round((ns.dette||0) + (-ns.money));
      ns.money = 0;
      debtIncurred = true;
    }
    // la hype retombe naturellement si rien ne l'entretient
    ns.hype = clamp((ns.hype||20) * 0.985, 0, 100);
    return { ns, cost, debtIncurred, staffCost, equipmentNote, passiveIncome };
  }

  // ---- Acceptation/refus d'une offre de sponsor "bad boy" apparue suite à une rupture de contrat
  // liée à la polémique (voir postSocial). Accepter relance un revenu récurrent généreux, mais
  // active une clause de scandale qui alimente la controverse chaque semaine du contrat. ----
  function acceptBadBoyOffer(){
    const offer = state.pendingBadBoyOffer;
    if (!offer) return;
    setState(s => ({ ...s, sponsorWeekly: offer.offeredWeekly, sponsorWeeksLeft: 20, badBoySponsorActive: true, pendingBadBoyOffer: null, badBoyOfferSeen: true }));
    pushLog(`😈 Contrat signé avec "${offer.label}" : +${eur(offer.offeredWeekly)}/semaine pendant 20 semaines, clause de scandale active.`);
  }
  function declineBadBoyOffer(){
    if (!state.pendingBadBoyOffer) return;
    setState(s => ({ ...s, pendingBadBoyOffer: null, badBoyOfferSeen: true }));
    pushLog(`🚫 Offre déclinée : tu préfères ne pas associer ton image à ce genre de sponsor.`);
  }

  function postSocial(post, platform){
    if ((state.socialPostsThisWeek||0) >= 2) return;
    const res = resolveSocialPost(post, state.followers||0);
    let ns = { ...state };
    ns.followers = Math.max(0, (state.followers||0) + res.followers);
    ns.hype = clamp((state.hype||20) + res.hype, 0, 100);
    ns.moral = clamp(state.moral + res.moral, 0, 100);
    ns.money = state.money + res.money;
    ns.socialControversy = clamp((state.socialControversy||0) + res.controversy, 0, 100);
    ns.socialPostsThisWeek = (state.socialPostsThisWeek||0) + 1;
    let lines = [`${platform.icon} [${platform.name}] ${post.label} — ${post.desc}`];
    lines.push(res.followers>=0 ? `👥 +${followersLabel(res.followers)} abonnés.` : `👥 ${followersLabel(res.followers)} abonnés (fuite d'audience).`);
    if (res.money>0) lines.push(`💰 Revenu sponsorisé : ${eur(res.money)}.`);
    else if (post.moneyGain && (state.followers||0) < SOCIAL_MONEY_MIN_FOLLOWERS) lines.push(`📉 Ton audience est encore trop restreinte (moins de ${followersLabel(SOCIAL_MONEY_MIN_FOLLOWERS)} abonnés) pour que les partenaires te rémunèrent.`);
    if (res.sponsorHit && state.sponsorWeekly){
      ns.sponsorWeekly = 0; ns.sponsorWeeksLeft = 0; ns.badBoySponsorActive = false;
      lines.push(`📉 La polémique coûte cher : un sponsor rompt son contrat avec toi.`);
      if (!state.badBoyOfferSeen && Math.random() < 0.5){
        const offer = rollBadBoySponsor();
        ns.pendingBadBoyOffer = offer;
        lines.push(`😈 ${offer.icon} Dans la foulée, "${offer.label}" te contacte : contrat bien plus lucratif, mais avec une clause de scandale qui entretient la polémique. À toi de voir dans l'onglet Communication.`);
      }
    } else if (res.sponsorHit){
      lines.push(`📉 La polémique fait fuir un sponsor potentiel qui négociait avec ton agent.`);
    }
    if (ns.socialControversy >= 70 && (state.socialControversy||0) < 70){
      lines.push(`🔥 Ta réputation en ligne devient clivante — les médias spécialisés en parlent beaucoup.`);
    }
    if (res.rivalSpark){
      lines.push(`⚔️ Ta publication déclenche une petite guerre des mots avec un autre combattant — une rivalité pourrait naître de ça.`);
    }
    setState(ns);
    lines.forEach(pushLog);
  }

  function hireStaff(staffId){
    if ((state.hiredStaff||[]).includes(staffId)) return;
    const spec = STAFF_SPECIALISTS.find(s=>s.id===staffId);
    if (!spec) return;
    const ns = { ...state, hiredStaff: [...(state.hiredStaff||[]), staffId] };
    setState(ns);
    pushLog(`🤝 ${spec.name} rejoint ton staff pour ${eur(spec.cost)}/mois.`);
  }

  function fireStaff(staffId){
    const spec = STAFF_SPECIALISTS.find(s=>s.id===staffId);
    const ns = { ...state, hiredStaff: (state.hiredStaff||[]).filter(id=>id!==staffId) };
    setState(ns);
    if (spec) pushLog(`👋 Fin de collaboration avec ${spec.name}.`);
  }

  function hireHeadCoach(coachId){
    if (state.headCoachId === coachId) return;
    const coach = headCoachById(coachId);
    const ns = { ...state, headCoachId: coachId, coachRelation: 55 };
    setState(ns);
    pushLog(`🤝 ${coach.name} devient ton coach principal (${eur(coach.cost)}/mois). Nouvelle alchimie à construire.`);
    closePanel();
  }

  function fireHeadCoach(){
    const coach = headCoachById(state.headCoachId);
    const ns = { ...state, headCoachId: "coach_debutant", coachRelation: 50 };
    setState(ns);
    pushLog(`👋 Fin de collaboration avec ${coach.name}.`);
  }

  function changeWeightClass(direction){
    const adj = adjacentWeightClasses(state.weightClassId);
    const target = direction === "up" ? adj.up : adj.down;
    if (!target) return;
    const currentWc = weightClassById(state.weightClassId);
    let ns = { ...state, weightClassId: target.id };
    ns = advanceCalendarWeeks(ns, 2);
    let lines = [];
    if (direction === "up"){
      // Monter de catégorie : plus de force/chin, mais cardio et rapidité pénalisés le temps de l'adaptation.
      const success = Math.random() < 0.7;
      if (success){
        ns.chin = clamp(ns.chin + rand(2,5), 0, 100);
        ns.cardio = clamp(ns.cardio - rand(2,6), 0, 100);
        lines.push(`⬆️ Montée en ${target.name} réussie : tu gagnes en puissance et en résistance, au prix d'un peu de cardio.`);
      } else {
        ns.cardio = clamp(ns.cardio - rand(6,12), 0, 100);
        ns.moral = clamp(ns.moral - 4, 0, 100);
        lines.push(`⚠️ La montée en ${target.name} est plus dure que prévu : ton corps peine à s'adapter à ce nouveau gabarit.`);
      }
    } else {
      // Descendre de catégorie : plus rapide/cardio, mais coupe de poids risquée pour la santé.
      const success = Math.random() < 0.6;
      if (success){
        ns.cardio = clamp(ns.cardio + rand(2,5), 0, 100);
        ns.health = clamp(ns.health - rand(3,8), 0, 100);
        lines.push(`⬇️ Descente en ${target.name} maîtrisée : tu gagnes en vitesse malgré une coupe de poids exigeante.`);
      } else {
        ns.health = clamp(ns.health - rand(10,20), 0, 100);
        ns.energie = clamp(ns.energie - rand(8,15), 0, 100);
        lines.push(`🩸 Coupe de poids brutale pour descendre en ${target.name} : ta santé en paie le prix.`);
      }
    }
    setState(ns);
    lines.forEach(pushLog);
    closePanel();
  }

  function goToCamp(camp){
    if (state.money < camp.cost) return;
    const prevLevels = computeLevels(state);
    let ns = { ...state, money: state.money - camp.cost };
    ns = advanceCalendarWeeks(ns, camp.weeksCost || 3);
    if (!(ns.campsDone||[]).includes(camp.id)) ns.campsDone = [...(ns.campsDone||[]), camp.id];
    const boostAmount = rand(...camp.boost) * (0.55 + DIFFICULTY.skillGainMult*0.45);
    if (camp.focus === "boxe" || camp.focus === "grappling" || camp.focus === "lutte"){
      addSkillBiased(ns, boostAmount, camp.focus);
    } else {
      ns[camp.focus] = clamp((ns[camp.focus]||0) + boostAmount, 0, 100);
    }
    ns.energie = clamp(ns.energie - rand(6,14), 0, 100);
    ns.moral = clamp(ns.moral + rand(2,6), 0, 100);
    let lines = [`✈️ Camp d'entraînement en ${camp.country} : ${camp.desc}`, `📈 Progression ciblée obtenue (${camp.focus}), stage validé pour les techniques avancées de cette discipline.`];
    if (camp.staffId && !(ns.discoveredStaff||[]).includes(camp.staffId)){
      ns.discoveredStaff = [...(ns.discoveredStaff||[]), camp.staffId];
      const spec = STAFF_SPECIALISTS.find(s=>s.id===camp.staffId);
      if (spec) lines.push(`🧑‍🏫 Tu fais la connaissance de ${spec.name}, désormais embauchable dans l'onglet Staff.`);
    }
    let ftotalDebt = false;
    for (let i=0;i<(camp.weeksCost||3);i++){
      const fin = applyLivingCosts(ns);
      ns = fin.ns;
      if (fin.debtIncurred) ftotalDebt = true;
    }
    if (ftotalDebt) lines.push(`💸 Le voyage pèse sur le budget, ta dette augmente (${eur(ns.dette)}).`);
    setState(ns);
    lines.forEach(pushLog);
    const levelUps = detectLevelUps(prevLevels, computeLevels(ns));
    if (levelUps.length){
      levelUps.forEach(u => pushLog(u.dir==="up" ? `📊 Niveau supérieur en ${u.label} : ${u.from} → ${u.to} (${u.levelName}) !` : `📉 Niveau inférieur en ${u.label} : ${u.from} → ${u.to} (${u.levelName})...`));
      triggerLevelUpToast(levelUps);
    }
    closePanel();
    advance(ns);
  }

  // (l'ancien déblocage aléatoire de techniques a été retiré : les techniques s'obtiennent
  // désormais uniquement via points de technique + niveau + coach/stage adapté, voir techniqueRequirementMet)

  function pushLog(line){ setLog(l => [...l, line]); }

  // Main pipeline: decides what the next screen should be.
  function advance(s){
    if (s.injuredTurns > 0){
      setOptions([{ type: "forced-rest" }]);
      setPhase("career");
      return;
    }

    // 0) an organisation contract just ended — it may want to renew it
    if (s.justEndedContractOrg){
      const org = s.justEndedContractOrg;
      const ns = { ...s, justEndedContractOrg: null };
      if (Math.random() < 0.7){
        setState(ns);
        setPendingContract(buildContractOffer(org, ns, true));
        setPhase("contract-offer");
        return;
      }
      pushLog(`📄 ${org.name} ne propose pas de nouveau contrat pour le moment.`);
      setState(ns);
      s = ns;
    }

    // NOTE : les happenings ("vie privée", entraînement, etc.) ne se déclenchent plus ici, dans le
    // menu principal. Ils sont désormais liés aux combats — voir continueAfterFightResult(), qui les
    // fait apparaître juste après un combat, avant de revenir au menu.

    // 2) chance of an unsolicited contract offer, if free agent
    const avail = availableOrgs(s.reputation, s.age);
    const eligibleForContract = !s.contract && avail.filter(o=>o.tier>=2 && s.reputation >= o.repReq+8);
    if (eligibleForContract && eligibleForContract.length && Math.random() < 0.3){
      const org = eligibleForContract[Math.floor(Math.random()*eligibleForContract.length)];
      setPendingContract(buildContractOffer(org, s, false));
      setPhase("contract-offer");
      return;
    }

    generateFightTurn(s);
  }

  function requestContract(org){
    closePanel();
    if (org.id === "ufc" && state.reputation < org.repReq - 15){
      pushLog(`📞 L'UFC ne te répond même pas — il te faut bien plus de réputation et de résultats avant d'espérer taper à cette porte.`);
      return;
    }
    const chance = contractChance(org, state);
    const success = Math.random()*100 < chance;
    if (success){
      setPendingContract(buildContractOffer(org, state, false));
      setPhase("contract-offer");
    } else {
      pushLog(org.id==="ufc"
        ? `📞 L'UFC décline poliment : "Reviens nous voir avec plus de popularité et un vrai palmarès."`
        : `📞 ${org.name} décline ta candidature pour l'instant — reviens avec plus de résultats et de réputation.`);
    }
  }

  function generateFightTurn(s){
    const avail = availableOrgs(s.reputation, s.age);
    let opts = [];

    // ---- Cooldown obligatoire après un combat : impossible d'enchaîner les combats semaine
    // après semaine. Un vrai camp de préparation (et une vraie récupération) est nécessaire. ----
    const weeksUntilNextFight = Math.max(0, (s.nextFightWeek||0) - (s.totalWeeks||s.week||1));
    if (weeksUntilNextFight > 0){
      opts.push({ type: "cooldown", weeksLeft: weeksUntilNextFight });
      opts.push({ type: "rest" });
      setOptions(opts);
      setPhase("career");
      return;
    }

    if (s.contract){
      const org = ORGS.find(o=>o.id===s.contract.orgId);
      opts.push(buildFightOption(org, s, true));
    } else {
      const pool = avail.length ? avail : [ORGS[0]];
      const shuffled = [...pool].sort(()=>Math.random()-0.5);
      const count = Math.min(s.reputation>40 ? 4 : 3, shuffled.length);
      for(let i=0;i<count;i++) opts.push(buildFightOption(shuffled[i], s, false));

      // Dana White's Contender Series path to the UFC
      if (!s.hasHadUFCContract && s.age >= 21 && s.reputation >= 45 && s.reputation <= 80 && s.dwcsAttempts < 3 && Math.random() < 0.35){
        opts.push(buildDwcsOption(s));
      }
    }

    opts.push({ type: "rest" });
    setOptions(opts);
    setPhase("career");
  }

  function buildFightOption(org, s, underContract){
    const mySkill = overallSkill(s);
    const wc = weightClassById(s.weightClassId);
    // ---- Défense de titre : si tu détiens déjà la ceinture de cette organisation, ton prochain
    // combat dans cette organisation reste automatiquement un combat de défense de titre. ----
    const isChampionHere = (s.titleHolderOrgs||[]).includes(org.id);
    const titleDefense = isChampionHere;
    // ---- Clause de titre négociée à la signature du contrat : garantit un combat pour le titre
    // dès que la série de victoires sous contrat requise est atteinte (une seule fois par contrat).
    const titleClauseTriggered = underContract && s.contract && s.contract.titleClause && !s.contract.titleClauseUsed
      && (s.contractWins||0) >= (s.contract.titleClauseStreak||3) && !titleDefense;
    const isTitle = titleDefense || titleClauseTriggered || (
      org.tier>=2
      && s.reputation >= org.repReq + DIFFICULTY.titleRepBuffer
      && (s.fights||0) >= DIFFICULTY.minFightsForTitle
      && Math.random() < 0.22 * DIFFICULTY.titleChanceMult
    );
    const legendary = titleDefense || ((org.tier>=3 || isTitle) && Math.random() < 0.32);
    // ---- Rivalité : un rival déjà rencontré dans cette organisation peut revenir en revanche ----
    const rival = !titleDefense ? findRival(s, org.id) : null;
    const isRival = !!rival && Math.random() < 0.55;
    // Les champions et légendes sont volontairement redoutables (difficulté relevée).
    const toughBonus = (legendary?18:0) + (isTitle?10:0) + (titleDefense?6:0);
    const oppSkillBase = isRival
      ? rival.oppSkill
      : clamp(rand(20,50) + org.tier*10 + (wc.opponentSkillAdj||0) + rand(-8,8), 15, 98);
    const oppSkill = clamp((oppSkillBase + toughBonus) * (legendary||isTitle ? DIFFICULTY.champTough : 1), 15, 99);
    const oppStyleId = pickOpponentStyle(org);
    const oppTraits = pickOpponentTraits(org, isTitle, legendary);
    const fatigue = s.injuredTurns>0 ? 10 : 0;
    // ---- Pénalité d'inexpérience : un combattant qui n'a pas encore accumulé beaucoup de
    // combats reste vulnérable, même avec de bonnes statistiques — la carrière ne peut plus
    // s'envoler dès les premières années. Cette pénalité s'estompe progressivement avec le
    // nombre de combats disputés (environ 16 combats pour la voir disparaître). ----
    const experiencePenalty = clamp(16 - (s.fights||0)*0.9, 0, 16);
    let winChance = 50 + (mySkill - oppSkill)*0.42
      + (s.health-70)*0.15 + (s.energie-70)*0.2 + (s.moral-70)*0.1
      + (s.cardio-70)*0.08 + (s.mental-70)*0.08 + (s.chin-70)*0.05
      - fatigue - experiencePenalty - traitsWinChanceMalus(oppTraits) - fatiguePenalty(s);
    winChance = clamp(winChance, 4, 92);
    const basePurse = (2000 + org.tier*3000) * org.payMult * (isTitle?1.8:1) * (legendary?1.25:1) * (isRival?1.15:1);
    const purseLow = Math.round(basePurse*0.7/100)*100;
    const purseHigh = Math.round(basePurse*1.3/100)*100;
    const netflix = org.tier>=3 && !underContract && Math.random() < 0.25;
    const eligibleLegends = s.gender === "homme" ? LEGENDS.filter(l => l.gender !== "F") : LEGENDS;
    const legend = legendary && !isRival ? (
      hallOfFame.length && Math.random()<0.2
        ? { name: hallOfFame[randInt(0, Math.min(hallOfFame.length,10)-1)].name, tag: "Ancienne légende du Hall of Fame" }
        : eligibleLegends[randInt(0,eligibleLegends.length-1)]
    ) : null;
    const card = determineCardPosition(org, s, isTitle, legendary);
    const city = randomCityFor(org);
    const travel = travelCostsFor(org, s);
    const feudMatch = !isRival && !legend && s.feudTarget && Math.random() < clamp((s.feudHeat||0)/140, 0, 0.5);
    // ---- Si le joueur a importé une vraie liste de combattants pour cette organisation, on pioche
    // dedans la plupart du temps (75%) plutôt que de générer un nom aléatoire. ----
    const rosterPool = customRosters[org.id];
    const rosterName = rosterPool && rosterPool.length && Math.random() < 0.75
      ? rosterPool[randInt(0, rosterPool.length-1)]
      : null;
    const opponentName = isRival ? rival.name : (legend ? legend.name : (feudMatch ? s.feudTarget : (rosterName || randName(s.gender))));
    const opponentTag = isRival
      ? (rivalTrilogyLabel(rival.meetings) || "Rival")
      : (legend ? legend.tag : (feudMatch ? "Guerre des mots" : null));
    let opt = {
      type: "fight", org, opponent: opponentName, opponentTag,
      oppSkill, oppStyleId, oppTraits, winChance, isTitle, purseLow, purseHigh, netflix, underContract, legendary,
      titleDefense, isRival, rivalMeetings: rival ? rival.meetings : 0,
      cardKey: card.key, cardLabel: card.label, city, travel,
      referee: pickReferee(), judges: pickJudgesPanel(),
      titleClauseFight: !!titleClauseTriggered,
      feudMatch: !!feudMatch,
      shortSponsorOffer: Math.random() < clamp(0.3 + (s.reputation-40)*0.004, 0.12, 0.55) ? buildShortSponsorOffer(org, s) : null,
      key: org.id + "-" + Math.random().toString(36).slice(2,7),
    };
    opt = maybeMakeLastMinute(opt);
    if (!opt.lastMinute) opt = maybeAssignOrgObjective(opt);
    return opt;
  }

  function buildDwcsOption(s){
    const mySkill = overallSkill(s);
    const oppSkill = clamp(rand(45,70), 30, 90);
    const oppTraits = pickOpponentTraits({ tier:2 }, false, false);
    let winChance = 50 + (mySkill - oppSkill)*0.55 + (s.health-70)*0.15 + (s.energie-70)*0.2 + (s.cardio-70)*0.05 - 4 - traitsWinChanceMalus(oppTraits) - fatiguePenalty(s);
    winChance = clamp(winChance, 10, 90);
    const oppStyleId = STYLES[randInt(0,2)].id;
    return {
      type: "fight", org: DWCS, opponent: randName(s.gender), opponentTag: null, oppSkill, oppStyleId, oppTraits, winChance,
      isTitle: false, purseLow: 4000, purseHigh: 6000, netflix:false, dwcs:true,
      cardKey:"main", cardLabel:"Carte principale", city:"Las Vegas", travel: travelCostsFor({region:"APEX, Las Vegas"}, s),
      referee: pickReferee(), judges: pickJudgesPanel(),
      key: "dwcs-" + Math.random().toString(36).slice(2,7),
    };
  }

  function pickFight(opt){
    if (opt.titleClauseFight || opt.feudMatch){
      setState(s2 => {
        let ns2 = { ...s2 };
        if (opt.titleClauseFight && ns2.contract) ns2.contract = { ...ns2.contract, titleClauseUsed: true };
        if (opt.feudMatch){ ns2.feudHeat = 0; ns2.feudTarget = null; }
        return ns2;
      });
      if (opt.feudMatch) pushLog(`⚔️ ${opt.org.name} organise enfin ce combat né d'une guerre des mots sur les réseaux !`);
    }
    const base = { ...opt, cutDay:1, cutWaterAccum:0, cutRiskAccum:0, cutHadDiete:false, cutPenalty:{} };
    if (opt.isRival){
      // ---- Trilogy Payday : avant une revanche ou une trilogie, une négociation de contrat
      // spéciale est proposée (Money Fight ou clause d'objectif de performance). ----
      setPendingFight(base);
      setPhase("fight-rivalcontract");
      return;
    }
    setPendingFight(base);
    setPhase("fight-weightcut");
  }

  function pickRivalClause(clauseId){
    const clause = RIVAL_CLAUSES.find(c=>c.id===clauseId) || RIVAL_CLAUSES[0];
    pushLog(`💼 Clause négociée pour ce combat de rivalité : "${clause.label}".`);
    setPendingFight({ ...pendingFight, rivalClause: clauseId });
    setPhase("fight-weightcut");
  }

  // Étape 1 & 2 : J-3 puis J-2, un choix de méthode par jour.
  function pickCutDayAction(actionId){
    const res = resolveCutDayAction(actionId, pendingFight.cutWaterAccum||0, pendingFight.cutRiskAccum||0);
    let ns = applyDelta({ ...state }, res.d);
    setState(ns);
    pushLog(`⚖️ J-${pendingFight.cutDay===1?3:2} coupe de poids — ${res.result}`);
    const mergedPenalty = { ...(pendingFight.cutPenalty||{}) };
    Object.keys(res.d||{}).forEach(k=>{ mergedPenalty[k] = (mergedPenalty[k]||0) + res.d[k]; });
    const opt = { ...pendingFight,
      cutWaterAccum: res.newWater, cutRiskAccum: res.newRisk,
      cutHadDiete: pendingFight.cutHadDiete || res.dieteRisk,
      cutPenalty: mergedPenalty,
    };
    if (pendingFight.cutDay === 1){
      setPendingFight({ ...opt, cutDay:2 });
      return;
    }
    // Après le 2ème jour : résolution de la pesée elle-même.
    const weighIn = resolveWeighIn(opt.cutWaterAccum, opt.cutRiskAccum, opt.cutHadDiete);
    let ns2 = applyDelta({ ...state, ...ns }, weighIn.d);
    setState(ns2);
    pushLog(`⚖️ Pesée — ${weighIn.result}`);
    if (weighIn.outcome === "fail"){
      setPendingFight(null);
      setPhase("career");
      advance(ns2);
      return;
    }
    setPendingFight({ ...opt, weighInResult: weighIn.result, cutBonus: weighIn.cutBonus });
    setPhase("fight-weightcut-rehydrate");
  }

  // Étape 3 : réhydratation post-pesée (24h avant de monter dans l'octogone).
  function pickRehydration(optionId){
    const hasNutri = (state.hiredStaff||[]).includes("nutritionniste");
    const res = resolveRehydration(optionId, pendingFight.cutPenalty, hasNutri);
    let ns = applyDelta({ ...state }, res.d);
    setState(ns);
    pushLog(`💧 ${res.result}`);
    const opt = { ...pendingFight, cutWinChanceDelta: pendingFight.cutBonus||0, rehydrationMode: optionId };
    setPendingFight(opt);
    setPhase(opt.shortSponsorOffer ? "fight-sponsor" : "fight-trashtalk");
  }

  // Étape sponsor short : accepter ou décliner le logo à arborer sur le short pour ce combat.
  function pickShortSponsor(accepted){
    const opt = { ...pendingFight, shortSponsorAccepted: accepted };
    if (accepted){
      pushLog(`👖 Accord signé avec ${opt.shortSponsorOffer.brand} : ${eur(opt.shortSponsorOffer.pay)} si le short est porté au moins ${opt.shortSponsorOffer.requiredRounds} rounds.`);
    } else {
      pushLog(`👖 Offre de ${opt.shortSponsorOffer.brand} déclinée.`);
    }
    setPendingFight(opt);
    setPhase("fight-trashtalk");
  }

  function pickTrashtalk(tt){
    const res = resolveTrashtalk(tt, state);
    const opt = { ...pendingFight, trashName: tt.name, trashWinDelta: res.winDelta, trashHype: res.hypeDelta, trashAura: res.auraDelta, trashMoral: res.moralDelta, trashLine: res.line, trashPurseMult: res.purseMult };
    setPendingTrashtalk(null);
    setPendingFight(opt);
    setPhase("fight-trashtalk2");
  }

  function pickRebuttal(rb){
    const res = resolveRebuttal(rb, state);
    const opt = { ...pendingFight,
      trashWinDelta: (pendingFight.trashWinDelta||0) + res.winDelta,
      trashHype: (pendingFight.trashHype||0) + res.hypeDelta,
      trashAura: (pendingFight.trashAura||0) + res.auraDelta,
      trashMoral: (pendingFight.trashMoral||0) + res.moralDelta,
      trashPurseMult: (pendingFight.trashPurseMult||1) * res.purseMult,
      rebuttalName: rb.name, trashLine2: res.line };
    setPendingFight(opt);
    // ---- Conférence de presse enrichie : environ un tiers du temps, un événement supplémentaire
    // (question piège, altercation, face-off interrompu, bousculade, bouteille lancée...) survient. ----
    if (Math.random() < 0.32){
      setPendingIncident(PRESSER_INCIDENTS[randInt(0, PRESSER_INCIDENTS.length-1)]);
      setPhase("fight-presser-incident");
    } else {
      setPhase("fight-tactic");
    }
  }

  function pickIncidentChoice(choice){
    const res = resolvePresserIncident(choice);
    const opt = { ...pendingFight,
      trashWinDelta: (pendingFight.trashWinDelta||0) + res.winDelta,
      trashHype: (pendingFight.trashHype||0) + res.hypeDelta,
      trashAura: (pendingFight.trashAura||0) + res.auraDelta,
      trashMoral: (pendingFight.trashMoral||0) + res.moralDelta,
      trashPurseMult: (pendingFight.trashPurseMult||1) * res.purseMult,
      incidentLine: choice.label };
    setPendingIncident(null);
    setPendingFight(opt);
    setPhase("fight-tactic");
  }

  // Techniques déjà maîtrisées, pertinentes pour la tactique choisie : utilisables en plein combat.
  // (Depuis la refonte, on ne "découvre" plus de technique inconnue en plein combat — il faut
  // l'avoir apprise avant, via points de technique + coach/stage adapté.)
  function eligibleFightTechniques(s, focusDiscipline){
    const known = TECHNIQUES.filter(t=> s.discoveredTechniques.includes(t.id));
    if (!known.length) return [];
    if (focusDiscipline){
      const focused = known.filter(t=>t.discipline===focusDiscipline || t.discipline==="general");
      if (focused.length) return focused;
    }
    return known;
  }

  // ---- Menu d'actions en plein combat : à CHAQUE round, le joueur choisit entre exactement TROIS
  // actions — une technique apprise (tirée au sort parmi celles maîtrisées, pour varier round après
  // round), une action risquée (très efficace mais dangereuse si elle échoue), ou le jeu prudent
  // (aucun risque, aucune récompense). Sans technique connue adaptée, un enchaînement standard
  // ("autre") remplace le créneau technique.
  function buildFightActions(s, tactic, opt){
    const known = eligibleFightTechniques(s, tactic.focus);
    const techChoice = known.length ? known[randInt(0, known.length-1)] : null;
    const traits = (opt && opt.oppTraits) || [];
    const fatigue = fatiguePenalty(s);
    // Une défense adverse solide rend toutes tes actions plus dures à placer ; une défense trouée les facilite.
    const defenseAdj = traits.includes("bonDefenseur") ? -6 : traits.includes("mauvaisDefenseur") ? 6 : 0;
    // Un cardio friable côté adverse te facilite la tâche à partir du round 3 ; un gros cardio la complique.
    const lateCardioAdj = (opt && opt.roundIndex>=3) ? (traits.includes("faibleCardio") ? 5 : traits.includes("grosCardio") ? -3 : 0) : 0;
    // Adaptation adverse EN PLEIN COMBAT (prudence accrue, bascule au sol) et blessures déjà subies ce combat.
    const adaptAdj = oppAdaptActionAdj(opt && opt.oppAdapt);
    const injuryAdj = fightInjuriesSuccessAdj(opt && opt.fightInjuries, tactic.focus);
    const injurySuffix = (opt && opt.fightInjuries && opt.fightInjuries.length) ? ` (gêné par : ${opt.fightInjuries.map(fi=>fi.label.toLowerCase()).join(", ")})` : "";
    const actions = [];
    if (techChoice){
      // Un adversaire qui encaisse trop de low kicks commence à checker : la technique perd en efficacité.
      const lowkickPenalty = techChoice.id==="lowkick" ? clamp(((opt&&opt.lowkickUses)||0)*5, 0, 20) : 0;
      actions.push({
        kind:"technique", id:techChoice.id, tech:techChoice,
        label:`🥋 Placer "${techChoice.name}"`,
        desc:techChoice.desc + (lowkickPenalty>0 ? " (il commence à checker tes low kicks…)" : "") + injurySuffix,
        successChance: Math.round(clamp(62 + (s.mental-70)*0.3 + (overallSkill(s)-50)*0.25 - techChoice.tier*4 + defenseAdj + lateCardioAdj + adaptAdj + injuryAdj - lowkickPenalty - fatigue*0.5, 10, 90)),
      });
    } else {
      actions.push({
        kind:"basic",
        label:"👊 Enchaînement standard",
        desc:"Un enchaînement solide et posé, sans technique particulière — fiable mais peu spectaculaire." + injurySuffix,
        successChance: Math.round(clamp(60 + defenseAdj + lateCardioAdj + adaptAdj + injuryAdj - fatigue*0.4, 10, 80)),
      });
    }
    actions.push({
      kind:"risky",
      label:"🔥 Action risquée — tout donner",
      desc:"Tu pousses l'allure à fond pour chercher la finish tout de suite. Immense récompense si ça passe, très dangereux si ça rate (dégâts et risque de blessure accrus)." + injurySuffix,
      successChance: Math.round(clamp(47 + (s.mental-70)*0.25 + (overallSkill(s)-50)*0.2 + defenseAdj*0.6 + lateCardioAdj + adaptAdj + injuryAdj - fatigue*0.6, 8, 68)),
    });
    actions.push({
      kind:"safe",
      label:"🛡️ Jouer la sécurité",
      desc:"Tu restes prudent, gères la distance sans forcer les événements.",
      successChance: null,
    });
    return actions;
  }

  function chooseTactic(tactic){
    const maxRoundPlanned = (pendingFight.isTitle || pendingFight.legendary) ? 5 : 3;
    const crowd = crowdEffect((state.countryPopularity||{})[pendingFight.org.region]);
    const opt = { ...pendingFight, tacticId: tactic.id, tacticName: tactic.name, roundIndex: 1, maxRoundPlanned, roundLines: [],
      roundHistory: [], fightInjuries: [], oppAdapt: {}, crowdWinAdj: crowd.winAdj, crowdMoralAdj: crowd.moralAdj,
      cagePosScore: 0,
      referee: pendingFight.referee || pickReferee(), judges: pendingFight.judges || pickJudgesPanel() };
    opt.roundLines.push(`🧑‍⚖️ Combat officié par ${opt.referee.name} (${refereeStyleLabel(opt.referee)}).`);
    if (crowd.label) opt.roundLines.push(crowd.label);
    // ---- Guerre psychologique : une aura écrasante (>80) intimide un adversaire au trait "peureux",
    // qui démarre le combat sur des bases fragiles — traduit en malus de rythme cardio dès le round 1. ----
    const highAura = (state.aura||0) > 80;
    const oppFearful = (opt.oppTraits||[]).includes("peureux");
    if (highAura && oppFearful){
      opt.intimidationRound1 = true;
      opt.roundLines.push(`🧠 Ton aura écrase psychologiquement un adversaire déjà sujet au doute : il entame le combat sur des jambes fébriles, environ -15% de rythme cardio dès le round 1.`);
    }
    setPendingFight(opt);
    setPhase("fight-prepweek");
  }

  // ---- Semaine de combat : comment répartir son temps avant d'entrer dans l'octogone ----
  function pickPrepWeek(choiceId){
    const tactic = TACTICS.find(t=>t.id===pendingFight.tacticId) || TACTICS[TACTICS.length-1];
    let opt = { ...pendingFight, prepWeek: choiceId, roundLines: [...(pendingFight.roundLines||[])] };
    let d = {};
    if (choiceId === "training"){
      opt.techniqueWinDelta = (opt.techniqueWinDelta||0) + 4;
      d = { energie:-3 };
      opt.roundLines.push(`🏋️ Semaine 100% camp d'entraînement : derniers ajustements techniques avant le combat.`);
    } else if (choiceId === "interviews"){
      opt.trashPurseMult = (opt.trashPurseMult||1) * 1.15;
      opt.trashHype = (opt.trashHype||0) + 2;
      d = { moral:-2 };
      opt.roundLines.push(`🎙️ Semaine chargée en interviews et promo : la bourse et le hype en profitent, mais moins de repos.`);
    } else {
      d = { moral:6 };
      opt.techniqueWinDelta = (opt.techniqueWinDelta||0) - 2;
      opt.roundLines.push(`👨‍👩‍👧 Semaine recentrée sur la famille : le moral est au beau fixe, la préparation un peu moins pointue.`);
    }
    let ns = applyDelta({ ...state }, d);
    if (choiceId === "interviews") ns.mentalFatigue = clamp((state.mentalFatigue||0) + rand(3,6), 0, 100);
    else if (choiceId === "training") ns.mentalFatigue = clamp((state.mentalFatigue||0) + rand(1,3), 0, 100);
    else ns.mentalFatigue = clamp((state.mentalFatigue||0) - rand(5,9), 0, 100);
    setState(ns);
    setPendingFight(opt);
    setPendingActions(buildFightActions(ns, tactic, opt));
    setPhase("fight-action");
  }

  // ---- Après une action (ou un moment décisif) résolue, on vérifie d'abord une éventuelle
  // intervention arbitrale (arrêt médical, arrêt du coin, accroc rarissime), puis si le combat se
  // termine là, tout de suite (KO/TKO/soumission) ; sinon on enchaîne sur le round suivant, jusqu'au
  // nombre de rounds prévu où une décision des juges tombe obligatoirement.
  function advanceRoundOrFinish(opt){
    const tactic = TACTICS.find(t=>t.id===opt.tacticId) || TACTICS[TACTICS.length-1];
    // ---- Mini-choix "coin de cutman" : quand une coupure ou un œil abîmé est présent, le médecin
    // du combat vient l'inspecter entre les rounds — le joueur choisit comment le coin le traite
    // avant que l'arbitre ne décide de la suite (voir pickCutmanChoice). ----
    if (hasActiveCutOrEyeInjury(opt.fightInjuries) && !opt.cutmanHandledThisRound){
      setPendingFight(opt);
      setPhase("fight-cutman");
      return;
    }
    const refIntervention = checkRefereeIntervention(opt, state);
    if (refIntervention){
      setPendingFight(null);
      chooseOption({ ...opt, preWin: refIntervention.win, preMethod: refIntervention.method, refereeLine: refIntervention.refereeLine });
      return;
    }
    const early = tryEarlyFinish(opt, tactic, state);
    if (early){
      setPendingFight(null);
      chooseOption({ ...opt, preWin: early.win, preMethod: early.method });
      return;
    }
    if (opt.roundIndex < opt.maxRoundPlanned){
      // ---- IA adverse qui s'adapte réellement à ce qui vient de se passer avant de construire le round suivant ----
      const { adapt, newLines } = computeOppAdaptation(opt, state);
      // ---- Une coupure ou un œil déjà touché peut s'aggraver d'un round à l'autre ----
      const worsen = worsenVisibleInjuries(opt.fightInjuries);
      const worsenLines = worsen.line ? [worsen.line] : [];
      const nextOpt = { ...opt, roundIndex: opt.roundIndex + 1, oppAdapt: adapt, fightInjuries: worsen.injuries, roundLines: [...opt.roundLines, ...newLines, ...worsenLines], cutmanHandledThisRound: false, cutmanRiskMult: 1 };
      setPendingFight(nextOpt);
      setPhase("fight-corner");
    } else {
      setPendingFight(null);
      chooseOption(opt);
    }
  }

  // ---- Résolution du choix de coin face à une coupure/œil abîmé : vaseline (sûr, effet modeste)
  // ou adrénaline (fort effet, une seule fois par combat, mais risque d'arrêt médical immédiat si
  // le médecin la repère). ----
  function pickCutmanChoice(choiceId){
    let opt = { ...pendingFight, cutmanHandledThisRound: true };
    if (choiceId === "vaseline"){
      opt.cutmanRiskMult = 0.72;
      opt.roundLines = [...(opt.roundLines||[]), `🧴 Ton cutman colmate la coupure à la vaseline entre les rounds — ça tient, sans miracle.`];
      setPendingFight(opt);
      advanceRoundOrFinish(opt);
    } else if (choiceId === "adrenaline"){
      const success = Math.random() < 0.6;
      opt.cutmanAdrenalineUsed = true;
      if (success){
        opt.cutmanRiskMult = 0.35;
        opt.fightInjuries = (opt.fightInjuries||[]).map(fi => (fi.id==="fi_coupure"||fi.id==="fi_oeil") ? { ...fi, severity: Math.max(0, (fi.severity||0)-1) } : fi);
        opt.roundLines = [...(opt.roundLines||[]), `💉 Le coach sort l'adrénaline en cachette : la coupure se referme quasiment sur le moment, l'arbitre n'y voit que du feu.`];
        setPendingFight(opt);
        advanceRoundOrFinish(opt);
      } else {
        opt.roundLines = [...(opt.roundLines||[]), `🚨 Le médecin repère le traitement irrégulier et n'hésite pas une seconde : arrêt immédiat du combat !`];
        const cumulative = (opt.roundHistory||[]).reduce((a,h)=>a+h.delta,0);
        setPendingFight(null);
        chooseOption({ ...opt, preWin: cumulative > 4, preMethod: { code:"arret_medecin", round: opt.roundIndex, decisionType:null, maxRound: opt.maxRoundPlanned }, refereeLine: `🩺 Traitement irrégulier détecté au coin : le médecin invite l'arbitre à stopper le combat sur-le-champ.` });
      }
    } else {
      // Ne rien faire de spécial : le médecin inspecte sans intervention particulière du coin.
      opt.roundLines = [...(opt.roundLines||[]), `🩺 Le médecin inspecte la blessure sans intervention particulière du coin.`];
      setPendingFight(opt);
      advanceRoundOrFinish(opt);
    }
  }

  // ---- Corner & ajustements entre les rounds : le coach donne son retour et un ordre à suivre
  // pour le round qui arrive (prise de risque, gestion de la décision, ou ciblage d'une coupure). ----
  // ---- Changement de tactique en plein combat : entre deux rounds, possibilité d'abandonner
  // complètement la tactique de départ pour une autre (contrairement à l'ordre de coin, qui ne fait
  // que doser l'agressivité sans changer le style de jeu). ----
  function pickCornerTacticSwitch(tacticId){
    const newTactic = TACTICS.find(t=>t.id===tacticId) || TACTICS[TACTICS.length-1];
    let opt = { ...pendingFight, tacticId: newTactic.id, tacticName: newTactic.name };
    opt.roundLines = [...(opt.roundLines||[]), `🔄 Changement de tactique en plein combat : tu passes à "${newTactic.name}" pour le round ${opt.roundIndex}.`];
    setPendingFight(opt);
    setPendingActions(buildFightActions(state, newTactic, opt));
    setPhase("fight-action");
  }

  function pickCornerOrder(orderId){
    const tactic = TACTICS.find(t=>t.id===pendingFight.tacticId) || TACTICS[TACTICS.length-1];
    let opt = { ...pendingFight, cornerOrder: orderId };
    if (orderId === "allin"){
      let ns = applyDelta({ ...state }, { energie:-6, cardio:-3 });
      setState(ns);
      opt.riskyFinishBoost = true;
      opt.roundLines = [...(opt.roundLines||[]), `📣 Ton coach : "On y va à fond, cherche la finition !"`];
    } else if (orderId === "manage"){
      opt.cornerHypePenalty = (opt.cornerHypePenalty||0) + 3;
      opt.roundLines = [...(opt.roundLines||[]), `📣 Ton coach : "On gère, on reste solide, pas de prise de risque inutile."`];
    } else if (orderId === "target_cut"){
      opt.roundLines = [...(opt.roundLines||[]), `📣 Ton coach : "Retravaille cette coupure, c'est là qu'il faut appuyer !"`];
    } else if (orderId === "reset_position"){
      let ns = applyDelta({ ...state }, { energie:-4 });
      setState(ns);
      opt.resetAttempt = true;
      opt.roundLines = [...(opt.roundLines||[]), `📣 Ton coach : "Dégage-toi de la cage, retrouve le centre !"`];
    }
    setPendingFight(opt);
    setPendingActions(buildFightActions(state, tactic, opt));
    setPhase("fight-action");
  }

  function pickMomentChoice(choice){
    const res = resolveMomentChoice(choice, state);
    let opt = { ...pendingFight,
      momentDelta: (pendingFight.momentDelta||0) + res.winDelta,
      momentHealth: (pendingFight.momentHealth||0) + res.extraHealth };
    opt.roundLines = [...(opt.roundLines||[]), `⚡ ${res.line}`];
    setPendingMoment(null);
    advanceRoundOrFinish(opt);
  }

  function pickFightAction(action){
    let opt = { ...pendingFight };
    const tactic = TACTICS.find(t=>t.id===opt.tacticId) || TACTICS[TACTICS.length-1];
    let line = "";
    let roundDelta = 0; // contribution de CE round pour la carte des juges, distincte du cumul techniqueWinDelta
    let injuryRisk = 0.05; // risque de base d'une blessure en plein combat, ce round
    let cageLines = [];
    // ---- Tentative de repositionnement demandée par le coach au round précédent : se dégager du
    // grillage avant même de résoudre l'action de ce round. ----
    if (opt.resetAttempt){
      const resetSuccess = Math.random() < 0.55;
      if (resetSuccess){
        opt.cagePosScore = (opt.cagePosScore||0) * 0.15;
        cageLines.push(`🔄 Tu parviens à te dégager du grillage et à retrouver le centre de la cage.`);
      } else {
        cageLines.push(`🔄 Tentative de repositionnement infructueuse — tu restes acculé contre le grillage.`);
      }
      opt.resetAttempt = false;
    }
    // ---- Cage Positioning : la zone où se déroule l'échange (avant la résolution de l'action)
    // apporte un léger bonus/malus de round et un ajustement du risque de blessure. ----
    const posBucketBefore = cagePositionBucket(opt.cagePosScore||0);
    const posRoundBonus = cagePositionRoundDelta(posBucketBefore);
    const posInjuryAdj = cagePositionInjuryAdj(posBucketBefore);
    if (action.kind === "technique"){
      if (action.id === "lowkick") opt.lowkickUses = (opt.lowkickUses||0) + 1;
      const success = Math.random()*100 < action.successChance;
      if (success){
        const gain = rand(8,14) + action.tech.tier*1.5;
        opt.techniqueWinDelta = (opt.techniqueWinDelta||0) + gain;
        roundDelta = gain;
        line = `🥋 Tu places ta technique "${action.tech.name}" à la perfection — un coup de maître !`;
      } else {
        const loss = rand(4,9);
        opt.techniqueWinDelta = (opt.techniqueWinDelta||0) - loss;
        opt.techniqueHealthDelta = (opt.techniqueHealthDelta||0) - rand(3,8);
        roundDelta = -loss;
        line = `⚠️ Tu tentes "${action.tech.name}" mais l'adversaire la lit bien : ça te coûte cher.`;
      }
    } else if (action.kind === "basic"){
      const success = Math.random()*100 < action.successChance;
      if (success){
        opt.techniqueWinDelta = (opt.techniqueWinDelta||0) + (roundDelta = rand(3,6));
        line = "👊 Ton enchaînement standard fait mouche, tu marques des points.";
      } else {
        const loss = rand(2,5);
        opt.techniqueWinDelta = (opt.techniqueWinDelta||0) - loss;
        roundDelta = -loss;
        line = "😮‍💨 Ton enchaînement standard est bien lu par l'adversaire, sans gros dégât.";
      }
    } else if (action.kind === "risky"){
      const success = Math.random()*100 < action.successChance;
      injuryRisk = 0.14;
      if (success){
        const gain = rand(16,24);
        opt.techniqueWinDelta = (opt.techniqueWinDelta||0) + gain;
        opt.riskyFinishBoost = true;
        roundDelta = gain;
        line = "🔥 Action risquée payante : tu prends totalement l'ascendant, l'adversaire vacille !";
      } else {
        const loss = rand(12,20);
        opt.techniqueWinDelta = (opt.techniqueWinDelta||0) - loss;
        opt.techniqueHealthDelta = (opt.techniqueHealthDelta||0) - rand(10,18);
        opt.riskyFailure = true;
        roundDelta = -loss;
        injuryRisk = 0.24;
        line = "💥 L'action risquée se retourne contre toi — tu t'es exposé et ça fait mal.";
      }
    } else {
      line = "🛡️ Tu restes prudent et gères la distance, sans prendre de risque inutile.";
      injuryRisk = 0.02;
    }
    // ---- Cage Positioning (suite) : le bonus/malus de zone s'ajoute au score du round, et l'action
    // fait elle-même dériver la position pour le round suivant (pousser au grillage / se faire pousser). ----
    roundDelta += posRoundBonus;
    opt.techniqueWinDelta = (opt.techniqueWinDelta||0) + posRoundBonus;
    injuryRisk += posInjuryAdj.selfAdj;
    let oppInjuryRiskCageBonus = posInjuryAdj.oppAdj;
    {
      let transitionDelta = 0;
      if (action.kind === "safe"){
        opt.cagePosScore = (opt.cagePosScore||0) * 0.6; // dérive naturelle vers le centre si on ne force rien
      } else {
        const successThisRound = roundDelta - posRoundBonus > 0; // issue de l'action seule, sans le bonus de zone
        const magnitude = action.kind==="risky" ? 0.9 : action.kind==="technique" ? 0.5 : 0.35;
        transitionDelta = successThisRound ? magnitude : -magnitude*0.9;
        opt.cagePosScore = clamp((opt.cagePosScore||0)*0.85 + transitionDelta, -2.2, 2.2);
      }
    }
    const posBucketAfter = cagePositionBucket(opt.cagePosScore||0);
    if (posBucketAfter !== posBucketBefore) cageLines.push(cagePositionLabel(posBucketAfter));
    // ---- Guerre psychologique : l'effet d'intimidation ne joue que sur le tout premier round, où
    // l'adversaire "peureux" démarre en méforme cardio face à une aura écrasante. ----
    if (opt.intimidationRound1 && opt.roundIndex === 1){
      roundDelta += 6;
      opt.techniqueWinDelta = (opt.techniqueWinDelta||0) + 6;
      injuryRisk *= 0.85;
      oppInjuryRiskCageBonus += 0.03;
    }
    // ---- Réaction du public en direct (huées/ovations) selon l'action et son issue ----
    opt.consecutiveSafe = action.kind==="safe" ? (opt.consecutiveSafe||0)+1 : 0;
    const actionSuccess = action.kind!=="safe" && roundDelta > 0;
    const crowdReact = crowdReactionLine(action, actionSuccess, opt.consecutiveSafe);
    if (crowdReact){
      line += ` ${crowdReact.line}`;
      opt.liveCrowdMoralAdj = (opt.liveCrowdMoralAdj||0) + crowdReact.moral;
      opt.liveCrowdHypeAdj = (opt.liveCrowdHypeAdj||0) + crowdReact.hype;
    }
    // ---- Effet de l'ordre de coin donné avant ce round ----
    let oppInjuryRisk = 0.05 + (action.kind==="risky"?0.05:0) + (action.kind==="technique"?0.03:0) + oppInjuryRiskCageBonus;
    if (opt.cornerOrder === "manage"){
      injuryRisk *= 0.55;
    } else if (opt.cornerOrder === "allin"){
      injuryRisk *= 1.25;
      oppInjuryRisk += 0.06;
      if (action.kind==="risky" && roundDelta>0){ roundDelta += 4; opt.techniqueWinDelta = (opt.techniqueWinDelta||0) + 4; }
    } else if (opt.cornerOrder === "target_cut"){
      oppInjuryRisk += 0.18;
    }
    opt.roundHistory = [...(opt.roundHistory||[]), { round: opt.roundIndex, delta: roundDelta, focus: tactic.focus, kind: action.kind }];
    // ---- Blessure survenant EN PLEIN COMBAT : plus probable si l'échange tourne mal ou si tu as
    // déjà encaissé, elle modifie réellement les décisions et actions pour le reste du combat. ----
    if ((opt.fightInjuries||[]).length < 2 && Math.random() < injuryRisk){
      const fi = rollFightInjury();
      opt.fightInjuries = [...(opt.fightInjuries||[]), fi];
      line += ` ${fi.icon} ${fi.label} ! ${fi.desc}`;
    }
    // ---- Coupure infligée à L'ADVERSAIRE ce round : miroir du risque de blessure du joueur ----
    if ((opt.oppCuts||[]).length < 2 && Math.random() < oppInjuryRisk){
      const oc = rollOpponentCut();
      opt.oppCuts = [...(opt.oppCuts||[]), oc];
      line += ` ${oc.icon} ${oc.label} chez l'adversaire !`;
    }
    opt.roundLines = [...(opt.roundLines||[]), ...cageLines, `Round ${opt.roundIndex}/${opt.maxRoundPlanned} — ${line}`];
    setPendingActions([]);
    if (Math.random() < 0.4){
      const moment = MOMENTS[randInt(0, MOMENTS.length-1)];
      setPendingFight(opt);
      setPendingMoment(moment);
      setPhase("fight-moment");
    } else {
      advanceRoundOrFinish(opt);
    }
  }

  function resolveFight(opt, s){
    const gym = currentGym(s);
    const tactic = TACTICS.find(t=>t.id===opt.tacticId) || TACTICS[TACTICS.length-1];
    const winDeltaTactic = tacticWinDelta(tactic, s);
    const staffWinBonus = staffEffect(s.hiredStaff, "winChanceBonus");
    // Les états persistants issus des happenings rares (mentorat d'une légende, camp parfait,
    // technique secrète, blessure chronique...) pèsent directement sur la chance de victoire.
    const persistentWinBonus = persistentSum(s, "winChanceBonus");
    // Cohérence de style : jouer contre le style naturel de l'adversaire coûte cher, jouer avec
    // l'avantage de style (le triangle boxeur/lutteur/grappler) aide franchement.
    const styleEdge = styleMatchupEdge(opt.oppStyleId, tactic.focus);
    const styleEdgeDelta = styleEdge * -9; // +1 (adversaire favorisé) => -9%, -1 (joueur favorisé) => +9%
    const localizedDelta = localizedInjuryWinChanceDelta(s, tactic);
    const styleEvoBonus = styleEvolutionWinChanceBonus(s, tactic);
    // ---- Adaptation adverse accumulée pendant le combat (IA qui réagit round après round) ----
    const oppAdaptDelta = oppAdaptWinDelta(opt.oppAdapt);
    // ---- Blessures survenues EN PLEIN COMBAT : elles pèsent sur la chance de victoire pour le reste du combat ----
    const fightInjuryDelta = fightInjuriesSuccessAdj(opt.fightInjuries, tactic.focus);
    let winChance = clamp(opt.winChance + winDeltaTactic + styleEdgeDelta + (opt.momentDelta||0) + (opt.trashWinDelta||0) + (opt.techniqueWinDelta||0) + (opt.cutWinChanceDelta||0) + staffWinBonus + persistentWinBonus + localizedDelta + styleEvoBonus + oppAdaptDelta + fightInjuryDelta + (opt.crowdWinAdj||0) + synergyWinChanceBonus(s) - fatiguePenalty(s) - mentalFatiguePenalty(s), 3, 95);
    // Si le combat s'est déjà terminé pendant la boucle de rounds (KO/TKO/soumission anticipé,
    // intervention arbitrale, blessure...), on reprend ce résultat tel quel plutôt que de le
    // re-tirer au sort ici. Pour une décision, ce sont les trois juges (notes round par round) qui tranchent.
    const method = opt.preMethod || pickDecisionMethod(opt);
    const win = opt.preMethod ? opt.preWin : (method.code==="decision" && method.decisionWin!=null ? method.decisionWin : (Math.random()*100 < winChance));
    const prevLevels = computeLevels(s);

    // ---- Issue neutre : no contest ou décision nulle — ni victoire ni défaite comptabilisée ----
    if (method.code==="no_contest" || (method.code==="decision" && method.decisionWin===null)){
      let ns0 = { ...s };
      ns0.recentTactics = [...(s.recentTactics||[]), tactic.id].slice(-3);
      ns0 = advanceCalendarWeeks(ns0, 1);
      // Même un no-contest / match nul use le corps : le prochain vrai camp reste obligatoire.
      ns0.nextFightWeek = ns0.totalWeeks + randInt(6, 9);
      const hypeFactor0 = clamp(1 + ((s.hype||20)-25)*0.007, 0.75, 1.55);
      let purse0 = Math.round(rand(opt.purseLow, opt.purseHigh) * (opt.netflix? 2.6 : 1) * hypeFactor0 * 0.7);
      if (s.contract) purse0 = Math.max(purse0, Math.round(s.contract.perFightMin*0.6));
      let agentCut0 = 0;
      if (s.hasAgent){ agentCut0 = Math.round(purse0*(s.agentCut||0.12)); purse0 -= agentCut0; }
      const tax0 = computeTax(purse0);
      purse0 -= tax0;
      ns0.money += purse0;
      ns0.totalEarnings = (s.totalEarnings||0) + purse0 + agentCut0 + tax0;
      ns0.totalTaxesPaid = (s.totalTaxesPaid||0) + tax0;
      ns0.noContests = (s.noContests||0) + 1;
      ns0.moral = clamp(ns0.moral - (method.code==="no_contest"?1:0), 0, 100);
      ns0.countryPopularity = { ...(s.countryPopularity||{}) };
      ns0.countryPopularity[opt.org.region] = clamp((ns0.countryPopularity[opt.org.region]||20) + 1, 0, 100);
      const travel0 = travelCostsFor(opt.org, s);
      ns0.money -= travel0.total;
      ns0.totalTravelSpent = (s.totalTravelSpent||0) + travel0.total;
      let lines0 = [`🧭 Stratégie choisie : ${tactic.name}.`];
      if (opt.roundLines && opt.roundLines.length) opt.roundLines.forEach(l => lines0.push(l));
      if (opt.refereeLine) lines0.push(opt.refereeLine);
      lines0.push(method.code==="no_contest"
        ? `⬜ NO CONTEST — un accroc accidentel force l'arbitre à annuler la décision, le combat n'est comptabilisé ni comme victoire ni comme défaite. Bourse tout de même : ${eur(purse0)}.`
        : `⬜ MATCH NUL (${method.decisionType}) face à ${opt.opponent} — les juges n'arrivent pas à départager. Bourse : ${eur(purse0)}.`);
      const fin0 = applyLivingCosts(ns0);
      ns0 = fin0.ns;
      ns0.lastFight = {
        win:null, methodCode: method.code, round: method.round||null, finish:false,
        dominated:false, dominantWin:false, embarrassingLoss:false, upsetWin:false,
        isTitle: !!opt.isTitle, titleWon:false, isRival: !!opt.isRival, rivalMeetings: opt.rivalMeetings||0,
        legendary: !!opt.legendary, netflix: !!opt.netflix,
        hadCut: (opt.fightInjuries||[]).some(fi=>fi.id==="fi_coupure"),
        hadEyeInjury: (opt.fightInjuries||[]).some(fi=>fi.id==="fi_oeil"),
        noContest: method.code==="no_contest", draw: method.code!=="no_contest",
        opponent: opt.opponent, opponentTag: opt.opponentTag||null,
      };
      const summary0 = {
        win:null, method, opponent: opt.opponent, opponentTag: opt.opponentTag, orgName: opt.org.name,
        isTitle: !!opt.isTitle, titleWon:false, netflix: !!opt.netflix, legendary: !!opt.legendary, dwcs: !!opt.dwcs,
        purse: purse0, agentCutAmount: agentCut0, contractBonusPay: 0,
        repBefore: s.reputation, repAfter: ns0.reputation,
        auraBefore: s.aura||0, auraAfter: ns0.aura||0,
        hypeBefore: s.hype||20, hypeAfter: ns0.hype||20,
        healthBefore: s.health, healthAfter: ns0.health,
        moralBefore: s.moral, moralAfter: ns0.moral,
        moneyBefore: s.money, moneyAfter: ns0.money,
        injury:false, recoveryWeeks:0, recoveryTag:"", medicalBan:false,
        travel: travel0, newUfcContract:false, levelUps:[], coachDecision:null,
        cardLabel: opt.cardLabel, city: opt.city, oppStyleId: opt.oppStyleId,
        referee: opt.referee, scorecards: method.scorecards||null, roundHistory: opt.roundHistory||[], fightInjuries: opt.fightInjuries||[],
        ns: ns0,
      };
      return { ns: ns0, lines: lines0, summary: summary0 };
    }

    const hypeFactor = clamp(1 + ((s.hype||20)-25)*0.007, 0.75, 1.55);
    // ---- Objectif imposé par l'organisation pour ce combat précis (spectacle, prime de
    // performance, combat référence, ou remplacement de dernière minute) ----
    const objectiveMet = opt.orgObjective ? !!opt.orgObjective.check(win, method, opt) : null;
    const objectivePurseMult = (opt.orgObjective && objectiveMet) ? (opt.orgObjective.rewardPurseMult||1) : 1;
    // Un sponsor premium ou un statut de "phénomène mondial" (états persistants) gonfle durablement la bourse.
    const persistentPayMult = 1 + persistentSum(s, "payMult");
    // ---- Trilogy Payday : clause de contrat négociée avant un combat de rivalité (voir
    // pickRivalClause). "Money Fight" garantit un plancher élevé sans condition ; les clauses
    // d'objectif (finish / KO-TKO dès le round 1) doublent quasiment la prime si atteintes, mais
    // la pénalisent si le combat se termine autrement. ----
    const isFinish = win && (method.code==="ko" || method.code==="tko" || method.code==="soumission");
    const isRound1Finish = isFinish && (method.round||1) === 1;
    let rivalClauseMult = 1;
    if (opt.rivalClause === "money") rivalClauseMult = 1.4;
    else if (opt.rivalClause === "finish") rivalClauseMult = isFinish ? 1.7 : 0.85;
    else if (opt.rivalClause === "round1ko") rivalClauseMult = isRound1Finish ? 2.2 : 0.8;
    let purse = Math.round(rand(opt.purseLow, opt.purseHigh) * (opt.netflix? 2.6 : 1) * (opt.legendary?1.2:1) * hypeFactor * (opt.trashPurseMult||1) * persistentPayMult * objectivePurseMult * rivalClauseMult);
    if (s.contract) purse = Math.max(purse, s.contract.perFightMin);
    let agentCutAmount = 0;
    if (s.hasAgent){ agentCutAmount = Math.round(purse*(s.agentCut||0.12)); purse -= agentCutAmount; }
    const taxAmount = computeTax(purse);
    purse -= taxAmount;

    let ns = { ...s };
    ns.recentTactics = [...(s.recentTactics||[]), tactic.id].slice(-3);
    ns.fights += 1;
    ns.money += purse;
    ns.totalEarnings = (s.totalEarnings||0) + purse + agentCutAmount + taxAmount;
    ns.totalTaxesPaid = (s.totalTaxesPaid||0) + taxAmount;
    ns = advanceCalendarWeeks(ns, 1);
    // ---- Cooldown obligatoire : un vrai camp de préparation (et une vraie récupération après le
    // combat) est nécessaire avant qu'un nouveau combat officiel puisse être proposé. Les combats
    // de titre, plus exigeants médiatiquement et physiquement, imposent un délai encore plus long. ----
    ns.nextFightWeek = ns.totalWeeks + (opt.isTitle ? randInt(9, 14) : randInt(6, 9));

    const cf = coachFactor(s);
    const chinFactor = clamp(1 - ((s.chin||0)+staffEffect(s.hiredStaff,"chinBonus")*4-50)*0.006, 0.65, 1.4);
    const cardioFactor = clamp(1 - ((s.cardio||0)+staffEffect(s.hiredStaff,"cardioBonus")*4-50)*0.005, 0.7, 1.3);
    const staffInjuryReduce = clamp(1 - staffEffect(s.hiredStaff,"injuryReduce"), 0.5, 1);
    const staffSkillBonus = staffEffect(s.hiredStaff, "skillBonus");

    // ---- Rivalité : les deux combattants progressent plus vite à l'approche d'une revanche ----
    const rivalPrepBonus = opt.isRival ? rand(1.3, 1.6) : 1;
    const skillGain = ((opt.netflix ? 0.35 : 1) * gym.skill * cf * rand(0.6,1.4) * (tactic.skillMult||1) * rivalPrepBonus + staffSkillBonus) * DIFFICULTY.skillGainMult;
    const healthCost = (opt.netflix ? 1.3 : 1) * rand(6,14) * (tactic.healthMult||1) * chinFactor;
    const energieCost = (opt.netflix ? 1.3 : 1) * rand(10,20) * (tactic.energyMult||1) * cardioFactor;
    // Une blessure chronique (cheville fragile, séquelles de commotion...) augmente durablement le
    // risque, tandis qu'une forme physique optimale ou un camp parfait le réduit à l'inverse.
    const persistentInjuryMult = clamp(1 + persistentSum(s, "injuryRiskDelta"), 0.5, 2.2);
    // Une charge de travail encore élevée à l'approche du combat (camp trop dur, pas assez affûté)
    // continue de peser sur le risque de blessure le soir du combat.
    const injuryBase = (opt.netflix ? 0.16 : 0.08) * ((opt.org.tier||3)*0.3+0.6) * gym.risk * (tactic.injuryMult||1) * chinFactor * staffInjuryReduce * persistentInjuryMult * localizedCutTkoMult(s) * overloadRiskMult(s.weeklyLoad) * DIFFICULTY.injuryMult;

    let lines = [];
    lines.push(`🧭 Stratégie choisie : ${tactic.name}.`);
    if (opt.rivalClause && opt.rivalClause !== "standard"){
      const clauseInfo = RIVAL_CLAUSES.find(c=>c.id===opt.rivalClause);
      if (clauseInfo){
        lines.push(`💼 Clause "${clauseInfo.label}" négociée pour ce combat de rivalité.`);
        if (opt.rivalClause === "finish") lines.push(isFinish ? `✅ Clause remplie (victoire avant la limite) : prime x1,7.` : `❌ Clause non remplie (le combat n'a pas été fini avant la limite) : prime réduite.`);
        else if (opt.rivalClause === "round1ko") lines.push(isRound1Finish ? `✅ Clause remplie (KO/TKO dès le round 1) : prime x2,2 !` : `❌ Clause non remplie : prime réduite.`);
        else if (opt.rivalClause === "money") lines.push(`💰 Money Fight : plancher garanti quel que soit le résultat.`);
      }
    }
    if (opt.orgObjective){
      lines.push(`📋 Mission de l'organisation : ${opt.orgObjective.label}`);
      lines.push(objectiveMet
        ? `✅ Mission accomplie ! Bourse et réputation bonifiées.`
        : `❌ ${opt.orgObjective.failNote || "Mission de l'organisation non remplie."}`);
    }
    lines.push(`👤 Style adverse : ${styleLabel(opt.oppStyleId)}. ${opponentGameplanLine(opt.oppStyleId, tactic.focus, opt.oppTraits)}`);
    const recentBefore = s.recentTactics||[];
    if (recentBefore.length>=2 && recentBefore[recentBefore.length-1]===tactic.id && recentBefore[recentBefore.length-2]===tactic.id){
      lines.push(`🔍 Il a visionné tes 3 derniers combats et s'attend exactement à cette approche répétée — l'effet de surprise a disparu.`);
    }
    if (opt.trashName) lines.push(`🎤 Conférence de presse (${opt.trashName}) : ${opt.trashLine}`);
    if (opt.rebuttalName) lines.push(`🎤 Réplique (${opt.rebuttalName}) : ${opt.trashLine2}`);
    if (opt.incidentLine) lines.push(`📸 Incident médiatique — tu choisis : ${opt.incidentLine}`);
    if (opt.trashPurseMult && opt.trashPurseMult !== 1) lines.push(`💰 Impact médiatique sur la bourse : x${opt.trashPurseMult.toFixed(2)}.`);
    if (opt.roundLines && opt.roundLines.length) opt.roundLines.forEach(l => lines.push(l));
    if (opt.refereeLine) lines.push(opt.refereeLine);
    // ---- Sponsor short : clause remplie si le combat a duré au moins le nombre de rounds requis,
    // indépendamment du résultat (victoire, défaite ou décision). ----
    if (opt.shortSponsorOffer && opt.shortSponsorAccepted){
      const roundsShown = method.round || opt.roundIndex || opt.maxRoundPlanned;
      if (roundsShown >= opt.shortSponsorOffer.requiredRounds){
        ns.money += opt.shortSponsorOffer.pay;
        ns.totalEarnings = (ns.totalEarnings||0) + opt.shortSponsorOffer.pay;
        lines.push(`👖 Clause sponsor "${opt.shortSponsorOffer.brand}" remplie (short porté ${roundsShown} round${roundsShown>1?"s":""}) : +${eur(opt.shortSponsorOffer.pay)}.`);
      } else {
        lines.push(`👖 Sponsor "${opt.shortSponsorOffer.brand}" : combat trop court pour remplir la clause (${opt.shortSponsorOffer.requiredRounds} rounds requis), aucune prime versée.`);
      }
    }

    // Méthodes / sévérité, utilisées pour les compteurs de fiche de fin de carrière et la convalescence.
    // (arrêt médecin, arrêt du coin et disqualification sont comptabilisés comme des TKO dans les statistiques.)
    const methodKey = method.code === "ko" ? "ko" : method.code === "soumission" ? "sub" : method.code === "decision" ? "dec" : "tko";
    let severeInjury = Math.random() < injuryBase * 0.35 * (opt.riskyFailure ? 1.9 : 1); // blessure grave indépendante, plus rare
    let recovery = computeRecoveryWeeks(method, win, severeInjury);
    // ---- Patrimoine : une équipe médicale dédiée (investissement) raccourcit les convalescences. ----
    if (hasInvestment(s, "medical_team") && recovery.weeks > 1){
      recovery = { ...recovery, weeks: Math.max(1, Math.round(recovery.weeks * 0.8)) };
    }
    // ---- Domination / niveau d'écart : calculés en amont pour rester disponibles côté victoire
    // ET défaite (utilisés à la fois pour les pénalités de défaite et pour la cohérence des
    // happenings post-combat, voir ns.lastFight plus bas). ----
    const dominated = (!win && methodKey==="ko" && recovery.tag==="KO violent") || (opt.oppSkill - overallSkill(s) > 22) || !!opt.riskyFailure;
    const embarrassing = (overallSkill(s) - opt.oppSkill > 15); // écart de niveau favorable au joueur
    const dominantWin = win && (methodKey==="ko"||methodKey==="tko"||methodKey==="sub") && (method.round||1) <= 2;
    const upsetWin = win && (opt.oppSkill - overallSkill(s) > 15);

    if (win){
      ns.wins += 1;
      ns.winStreak = (s.winStreak||0) + 1;
      ns.lossStreakRun = 0;
      ns.longestWinStreak = Math.max(s.longestWinStreak||0, ns.winStreak);
      if (methodKey==="ko") ns.koWins = (s.koWins||0)+1;
      else if (methodKey==="tko") ns.tkoWins = (s.tkoWins||0)+1;
      else if (methodKey==="sub") ns.subWins = (s.subWins||0)+1;
      else ns.decWins = (s.decWins||0)+1;
      addSkillBiased(ns, skillGain + (opt.isTitle?1.5:0), tactic.focus);
      ns.reputation = clamp(ns.reputation + (opt.org.repMult||1.3) * (opt.isTitle? 9: 4.5) * (tactic.reputationMult||1) + staffEffect(s.hiredStaff,"reputationBonus") + persistentSum(s,"reputationBonus") + (objectiveMet ? opt.orgObjective.rewardRep : 0), 0, 100);
      ns.health = clamp(ns.health - healthCost + (opt.momentHealth||0) + (opt.techniqueHealthDelta||0), 0, 100);
      ns.energie = clamp(ns.energie - energieCost, 0, 100);
      ns.mentalFatigue = clamp((s.mentalFatigue||0) + rand(5,10) + (opt.isTitle?4:0) + ((opt.roundHistory||[]).length>=4?3:0), 0, 100);
      ns.moral = clamp(ns.moral + 5 + (opt.trashMoral||0) + (opt.crowdMoralAdj||0) + (opt.liveCrowdMoralAdj||0), 0, 100);
      ns.aura = clamp((ns.aura||0) + (opt.isTitle?7:3) + (opt.netflix?4:0) + (opt.legendary?5:0) + (opt.trashAura||0), 0, 100);
      ns.chin = clamp((ns.chin||0) + 0.2, 0, 100);
      // Un combat de rivalité dégage 50 % de hype en plus.
      const rivalHypeMult = opt.isRival ? 1.5 : 1;
      const ppvMult = (s.passivePerks||[]).includes("vendeur_ppv") ? 1.6 : 1;
      ns.hype = clamp((ns.hype||20) + ((opt.trashHype||0)*ppvMult + (opt.isTitle?12:5) + (opt.netflix?6:0)) * rivalHypeMult + staffEffect(s.hiredStaff,"hypeBonus") + persistentSum(s,"hypeBonus") - (opt.cornerHypePenalty||0) + (opt.liveCrowdHypeAdj||0), 0, 100);
      if (purse > (s.biggestPurse||0)) ns.biggestPurse = purse;
      if ((opt.isTitle || opt.legendary) && (ns.hype||0) >= 65 && Math.random()<0.4) ns.fightsOfTheYear = (s.fightsOfTheYear||0)+1;
      if (opt.isTitle){
        if (opt.titleDefense){
          ns.titleDefenses = (s.titleDefenses||0) + 1;
          lines.push(`🛡️ DÉFENSE DE TITRE RÉUSSIE PAR ${methodLabel(method).toUpperCase()} ! ${name} conserve la ceinture ${opt.org.name} face à ${opt.opponent}${opt.opponentTag?` (${opt.opponentTag})`:""} (défense n°${ns.titleDefenses}).`);
        } else {
          ns.titles += 1;
          ns.titlesWonOrgs = [...(s.titlesWonOrgs||[]), opt.org.name];
          ns.titleHolderOrgs = [...(s.titleHolderOrgs||[]).filter(id=>id!==opt.org.id), opt.org.id];
          lines.push(`🏆 VICTOIRE PAR ${methodLabel(method).toUpperCase()} ! ${name} remporte le titre ${opt.org.name} face à ${opt.opponent}${opt.opponentTag?` (${opt.opponentTag})`:""} ! Tant que tu recombattras dans cette organisation, ce sera pour défendre ta ceinture.`);
        }
      }
      else lines.push(`✅ Victoire par ${methodLabel(method)} face à ${opt.opponent}${opt.opponentTag?` — ${opt.opponentTag}`:""} sous la bannière ${opt.org.name}. Bourse : ${eur(purse)}.`);
      if (opt.isRival && opt.rivalMeetings>=2) lines.push(`🔥 Trilogie remportée face à ${opt.opponent} — une rivalité qui restera dans les mémoires.`);
      ns = updatePlayerRankOnWin(ns, opt.org, !!opt.isTitle && !opt.titleDefense);
      ns = updatePlayerGlobalRankOnWin(ns, !!opt.isTitle && !opt.titleDefense, methodKey!=="dec", !!opt.legendary);
      if (opt.legendary) ns.legendWins = (s.legendWins||0) + 1;
    } else {
      ns.losses += 1;
      ns.lossStreakRun = (s.lossStreakRun||0) + 1;
      ns.winStreak = 0;
      ns.longestLossStreak = Math.max(s.longestLossStreak||0, ns.lossStreakRun);
      if (methodKey==="ko") ns.koLosses = (s.koLosses||0)+1;
      else if (methodKey==="tko") ns.tkoLosses = (s.tkoLosses||0)+1;
      else if (methodKey==="sub") ns.subLosses = (s.subLosses||0)+1;
      else ns.decLosses = (s.decLosses||0)+1;
      addSkillBiased(ns, skillGain*0.3, tactic.focus);

      // La défaite fait vraiment mal : réputation, sponsors (hype) et parfois le contrat lui-même.
      const repLoss = 2.5 * DIFFICULTY.lossRepMult * (dominated?1.6:1) * (embarrassing?1.4:1);
      ns.reputation = clamp(ns.reputation - repLoss, 0, 100);
      ns.health = clamp(ns.health - healthCost*1.2 + (opt.momentHealth||0) + (opt.techniqueHealthDelta||0), 0, 100);
      ns.energie = clamp(ns.energie - energieCost*1.1, 0, 100);
      ns.mentalFatigue = clamp((s.mentalFatigue||0) + rand(7,14) + (dominated?4:0), 0, 100);
      const guerrierCage = (s.passivePerks||[]).includes("guerrier_cage") && method.code==="decision" && method.decisionType==="partagée";
      ns.moral = clamp(ns.moral - (guerrierCage?3:6)*(1-clamp((s.mental-50)*0.005,-0.3,0.3)) + (opt.trashMoral||0)*0.4 + (opt.crowdMoralAdj||0)*0.6 + (opt.liveCrowdMoralAdj||0), 0, 100);
      ns.aura = clamp((ns.aura||0) - 3*(dominated?1.8:1) + (opt.trashAura||0)*0.3, 0, 100);
      const ppvMultLoss = (s.passivePerks||[]).includes("vendeur_ppv") ? 1.6 : 1;
      ns.hype = clamp((ns.hype||20)*(dominated?0.85:0.95) + (opt.trashHype||0)*0.5*ppvMultLoss + 2 - (opt.cornerHypePenalty||0)*0.5 + (opt.liveCrowdHypeAdj||0), 0, 100);

      // ---- Perte de niveau de stats : dépend de la manière dont tu perds ----
      const focusKey = tactic.focus;
      let statPenalty = 0;
      if (dominated) statPenalty += rand(8,15);
      if (embarrassing) statPenalty += rand(6,11);
      if (!dominated && !embarrassing) statPenalty += rand(1,4); // usure normale même sur une défaite serrée
      // Un mental élevé limite nettement le craquage après une défaite ; un mental faible l'aggrave.
      const mentalMitigation = clamp(1 - ((s.mental||50)-50)*0.008, 0.7, 1.25);
      statPenalty *= mentalMitigation;
      if (focusKey && statPenalty>0){
        ns[focusKey] = clamp(ns[focusKey] - statPenalty, 0, 99);
      } else if (statPenalty>0){
        addSkillAll(ns, -statPenalty*0.4);
      }
      if (dominated) ns.mental = clamp((ns.mental||0) - rand(2,6), 0, 100);

      lines.push(`❌ Défaite par ${methodLabel(method)} contre ${opt.opponent}${opt.opponentTag?` — ${opt.opponentTag}`:""} (${opt.org.name}). Bourse tout de même : ${eur(purse)}.`);
      if (dominated) lines.push(`💥 Domination totale subie — cette défaite laisse des traces durables sur tes stats.`);
      else if (embarrassing) lines.push(`😬 Défaite embarrassante face à un adversaire nettement plus faible — ta cote en pâtit.`);

      // Risque qu'une défaite brutale sous contrat pousse l'organisation à rompre le deal.
      if (s.contract && dominated && Math.random() < 0.28){
        lines.push(`📄 ${s.contract.orgName} met fin au contrat après cette défaite sévère.`);
        ns.contract = null;
      }
      // ---- Licenciement après une SÉRIE de défaites sous contrat : indépendant de la défaite du
      // jour elle-même, une organisation ne garde pas éternellement un combattant qui enchaîne les
      // revers, même serrés. Le risque grimpe avec la longueur de la série. ----
      else if (ns.contract && ns.lossStreakRun >= 3){
        const releaseChance = clamp((ns.lossStreakRun - 2) * 0.22, 0.2, 0.7);
        if (Math.random() < releaseChance){
          lines.push(`📄 Après ${ns.lossStreakRun} défaites consécutives, ${ns.contract.orgName} se sépare de toi et met fin au contrat.`);
          ns.contract = null;
        }
      }
      // La ceinture change de mains si la défense de titre est perdue.
      if (opt.titleDefense){
        ns.titleHolderOrgs = (s.titleHolderOrgs||[]).filter(id=>id!==opt.org.id);
        lines.push(`💔 La ceinture ${opt.org.name} change de mains — ta défense de titre s'arrête ici.`);
      }
      ns.orgRanks = ns.orgRanks || {};
      if ((ns.orgRanks[opt.org.id]||0) > 0) ns.orgRanks[opt.org.id] = Math.min(15, ns.orgRanks[opt.org.id] + randInt(1,2));
      ns = updatePlayerGlobalRankOnLoss(ns, dominated);
    }

    // ---- Rivalité : l'adversaire peut devenir (ou rester) un rival après ce combat ----
    ns = maybeCreateOrUpdateRival(ns, opt, win);
    // ---- Popularité par pays/région : ta cote locale évolue avec ce résultat ----
    {
      const region = opt.org.region;
      ns.countryPopularity = { ...(s.countryPopularity||{}) };
      const before = ns.countryPopularity[region] || 20;
      const after = clamp(before + countryPopularityDelta(win, method, opt.isTitle), 0, 100);
      ns.countryPopularity[region] = after;
      ns.popularityMilestones = { ...(s.popularityMilestones||{}) };
      if (after >= 75 && !ns.popularityMilestones[region+"_star"]){
        ns.popularityMilestones[region+"_star"] = true;
        lines.push(`🌟 Tu deviens une véritable star en/au ${region} — le public local t'adore.`);
      } else if (after <= 8 && before > 8 && !ns.popularityMilestones[region+"_hated"]){
        ns.popularityMilestones[region+"_hated"] = true;
        lines.push(`💢 Ta cote s'effondre en/au ${region} — le public local ne te porte plus dans son cœur.`);
      }
    }
    // ---- Blessure localisée éventuelle (indépendante de la blessure grave générique) ----
    // Priorité aux blessures effectivement subies EN PLEIN COMBAT (nez, œil, cheville, main,
    // coupure...) : si l'une d'elles se transforme en séquelle durable, elle prend le pas sur le
    // tirage générique pour rester cohérente avec ce qui vient de se passer sur le ring.
    const convertibleFightInjury = (opt.fightInjuries||[]).find(fi=>fi.mapsToLocalized) || null;
    if (!win && convertibleFightInjury && Math.random() < 0.55){
      const base = localizedInjuryById(convertibleFightInjury.mapsToLocalized);
      if (base){
        const li = { id: base.id, label: base.label, icon: base.icon, zone: base.zone, weeksLeft: randInt(...base.weeks) };
        ns.localizedInjuries = [...(ns.localizedInjuries||[]).filter(x=>x.id!==li.id), li];
        lines.push(`${li.icon} La blessure subie en plein combat laisse des séquelles : ${li.label} (environ ${li.weeksLeft} semaines de gêne persistante).`);
      }
    } else if (!win && (recovery.weeks > 2 || severeInjury) && Math.random() < 0.4){
      const li = rollLocalizedInjury();
      ns.localizedInjuries = [...(ns.localizedInjuries||[]).filter(x=>x.id!==li.id), li];
      lines.push(`${li.icon} Blessure localisée : ${li.label} (environ ${li.weeksLeft} semaines de gêne persistante).`);
    }

    if (agentCutAmount > 400) lines.push(`🧑‍💼 Commission de ton agent prélevée : ${eur(agentCutAmount)}.`);
    if (taxAmount > 300) lines.push(`🧾 Impôts prélevés sur la bourse : ${eur(taxAmount)}.`);

    // ---- Convalescence hebdomadaire (remplace l'ancien système de "cycles") ----
    let injuryOccurred = false;
    ns.injuredTurns = Math.max(ns.injuredTurns||0, recovery.weeks - 1);
    if (recovery.weeks > 2 || severeInjury){
      injuryOccurred = true;
      ns.injuryCount = (s.injuryCount||0) + 1;
      if (severeInjury) ns.severeInjuryCount = (s.severeInjuryCount||0) + 1;
    }
    ns.weeksInjuredTotal = (s.weeksInjuredTotal||0) + recovery.weeks;
    if (recovery.tag) lines.push(`🩹 ${recovery.tag} : ${recovery.weeks} semaine${recovery.weeks>1?"s":""} de convalescence${recovery.medicalBan?" (interdiction médicale de combattre)":""}.`);

    // ---- Frais de déplacement (billets, hôtel, staff) et pays visités ----
    const travel = travelCostsFor(opt.org, s);
    ns.money -= travel.total;
    ns.totalTravelSpent = (s.totalTravelSpent||0) + travel.total;
    if (!(ns.countriesVisited||[]).includes(opt.org.region)) ns.countriesVisited = [...(s.countriesVisited||[]), opt.org.region];
    lines.push(`✈️ Déplacement à ${opt.city} (${opt.org.region}) : billets ${eur(travel.flight)}, hôtel ${eur(travel.hotel)}, staff ${eur(travel.coachTravel)} — total ${eur(travel.total)}.`);

    if (opt.netflix) lines.push(`📺 Combat évènementiel Netflix : gros chèque, mais préparation moins spécifique.`);
    if (opt.legendary) lines.push(`🐐 Un affrontement face à une légende du circuit — l'événement marque les esprits.`);

    if (win){
      const gained = (opt.isTitle ? 2 : 1);
      ns.techPoints = (ns.techPoints||0) + gained;
      lines.push(`🧠 +${gained} point${gained>1?"s":""} de technique gagné${gained>1?"s":""} sur cette victoire.`);
    }

    // Contract bookkeeping: bonuses + fights remaining + possible renewal trigger
    // (s.contract sert de référence, mais on vérifie ns.contract : si le contrat vient d'être
    // résilié plus haut — défaite sévère ou série de défaites — pas de décompte à faire dessus.)
    let contractBonusPay = 0;
    if (s.contract && ns.contract){
      let bonusPay = 0;
      if (win){
        bonusPay += s.contract.winBonus || 0;
        if (opt.isTitle) bonusPay += s.contract.titleBonus || 0;
      }
      if (bonusPay > 0){
        ns.money += bonusPay;
        contractBonusPay = bonusPay;
        lines.push(`💰 Prime de contrat perçue : ${eur(bonusPay)}.`);
      }
      ns.contractWins = (s.contractWins||0) + (win?1:0);
      ns.contractFightsTotal = (s.contractFightsTotal||0) + 1;
      ns.contract = { ...s.contract, fightsRemaining: s.contract.fightsRemaining - 1 };
      if (ns.contract.fightsRemaining <= 0){
        lines.push(`📄 Contrat avec ${ns.contract.orgName} arrivé à son terme — retour au statut d'agent libre.`);
        ns.contractWinRateLast = ns.contractFightsTotal ? ns.contractWins/ns.contractFightsTotal : 0;
        ns.justEndedContractOrg = ORGS.find(o=>o.id===ns.contract.orgId) || null;
        ns.contract = null;
        ns.contractWins = 0;
        ns.contractFightsTotal = 0;
      }
    }

    // Dana White's Contender Series outcome
    if (opt.dwcs){
      ns.dwcsAttempts = s.dwcsAttempts + 1;
      if (win && Math.random() < 0.75){
        ns.contract = { orgId: "ufc", orgName: "UFC", fightsRemaining: 4, perFightMin: 12000, winBonus: 6000, titleBonus: 15000 };
        ns.contractWins = 0;
        ns.contractFightsTotal = 0;
        ns.hasHadUFCContract = true;
        ns.reputation = clamp(ns.reputation + 15, 0, 100);
        lines.push(`🎙️ Dana White t'accorde un contrat UFC sur-le-champ !`);
      } else if (win){
        lines.push(`Performance saluée, mais pas de contrat accordé ce soir-là.`);
      } else {
        lines.push(`Occasion manquée face aux caméras de l'UFC — il faudra retenter ta chance.`);
      }
    }

    // Coach principal : la relation évolue avec les résultats, et un choix de licencier/continuer
    // peut se présenter après une série de défaites (perte de confiance) ou une grande victoire (ambition).
    let coachDecision = null;
    if (!win){
      ns.lossStreak = (s.lossStreak||0) + 1;
      ns.coachRelation = clamp(ns.coachRelation - 6, 0, 100);
      if (ns.lossStreak >= 2 && Math.random() < 0.6) coachDecision = "loss";
    } else {
      ns.lossStreak = 0;
      ns.coachRelation = clamp(ns.coachRelation + 3, 0, 100);
      if ((opt.isTitle || opt.legendary) && Math.random() < 0.35) coachDecision = "win";
    }

    const fin = applyLivingCosts(ns);
    ns = fin.ns;
    if (fin.debtIncurred) lines.push(`💸 Fins de mois difficiles : tes dépenses dépassent tes revenus, dette en hausse (${eur(ns.dette)}).`);
    if (fin.equipmentNote) lines.push(fin.equipmentNote);

    const newLevels = computeLevels(ns);
    const levelUps = detectLevelUps(prevLevels, newLevels);
    levelUps.forEach(u => lines.push(u.dir==="up" ? `📊 Niveau supérieur en ${u.label} : ${u.from} → ${u.to} (${u.levelName}) !` : `📉 Niveau inférieur en ${u.label} : ${u.from} → ${u.to} (${u.levelName})...`));

    // ---- Style évolutif : signale un changement de style dominant ----
    const styleBefore = computeFightingStyleEvolution(s);
    const styleAfter = computeFightingStyleEvolution(ns);
    if (styleAfter && (!styleBefore || styleBefore.id !== styleAfter.id)){
      lines.push(`🧬 Ton style de combat évolue : "${styleAfter.label}" — ${styleAfter.desc}`);
    }

    // ---- Instantané du dernier combat : sert de référence de cohérence pour les happenings
    // déclenchés juste après (voir cond(s) des événements de catégorie "Combat" et assimilés) —
    // un happening ne doit pouvoir surgir que s'il correspond à ce qui vient réellement de se
    // passer sur l'octogone (coupure, domination, revanche, round expéditif...). ----
    ns.lastFight = {
      win, methodCode: method.code, round: method.round||null,
      finish: (methodKey==="ko"||methodKey==="tko"||methodKey==="sub"),
      dominated: !win && dominated, dominantWin, embarrassingLoss: !win && embarrassing, upsetWin,
      isTitle: !!opt.isTitle, titleWon: !!(win && opt.isTitle && !opt.titleDefense),
      isRival: !!opt.isRival, rivalMeetings: opt.rivalMeetings||0,
      legendary: !!opt.legendary, netflix: !!opt.netflix,
      hadCut: (opt.fightInjuries||[]).some(fi=>fi.id==="fi_coupure"),
      hadEyeInjury: (opt.fightInjuries||[]).some(fi=>fi.id==="fi_oeil"),
      noContest: false, draw: false,
      opponent: opt.opponent, opponentTag: opt.opponentTag||null,
    };

    const summary = {
      win, method, opponent: opt.opponent, opponentTag: opt.opponentTag, orgName: opt.org.name,
      isTitle: !!opt.isTitle, titleWon: !!(win && opt.isTitle), netflix: !!opt.netflix, legendary: !!opt.legendary, dwcs: !!opt.dwcs,
      purse, agentCutAmount, contractBonusPay,
      repBefore: s.reputation, repAfter: ns.reputation,
      auraBefore: s.aura||0, auraAfter: ns.aura||0,
      hypeBefore: s.hype||20, hypeAfter: ns.hype||20,
      healthBefore: s.health, healthAfter: ns.health,
      moralBefore: s.moral, moralAfter: ns.moral,
      moneyBefore: s.money, moneyAfter: ns.money,
      injury: injuryOccurred,
      recoveryWeeks: recovery.weeks, recoveryTag: recovery.tag, medicalBan: !!recovery.medicalBan,
      travel,
      newUfcContract: !!(opt.dwcs && win && ns.contract && ns.contract.orgId==="ufc"),
      levelUps,
      coachDecision,
      cardLabel: opt.cardLabel, city: opt.city, oppStyleId: opt.oppStyleId,
      referee: opt.referee, scorecards: method.scorecards||null, roundHistory: opt.roundHistory||[], fightInjuries: opt.fightInjuries||[],
      ns,
    };

    return { ns, lines, summary };
  }

  // ---- Aléas hebdomadaires d'entraînement : chaque semaine de repos/travail a une chance de
  // basculer sur un petit événement narratif qui module légèrement les stats — surentraînement,
  // séance exceptionnelle ou ratée, partenaire de sparring fort/faible, maladie, plateau, etc. ----
  const TRAINING_VARIANCE = [
    { id:"excellente", w:14, label:"🔥 Séance exceptionnelle", apply:(ns)=>{ addSkillAll(ns, 0.5*DIFFICULTY.skillGainMult); ns.moral=clamp(ns.moral+3,0,100); return "Une semaine de travail exceptionnelle, tout est passé à la perfection."; } },
    { id:"mauvaise", w:16, label:"😮‍💨 Mauvaise séance", apply:(ns)=>{ ns.moral=clamp(ns.moral-3,0,100); return "Semaine poussive à l'entraînement, rien ne fonctionne comme prévu."; } },
    { id:"partenaire_fort", w:10, label:"🥊 Nouveau partenaire redoutable", apply:(ns)=>{ addSkillAll(ns, 0.4*DIFFICULTY.skillGainMult); ns.chin=clamp((ns.chin||0)+0.3,0,100); return "Un sparring-partner très costaud débarque à la salle : niveau général en légère hausse."; } },
    { id:"partenaire_faible", w:6, label:"🤝 Partenaire en méforme", apply:()=>{ return "Le partenaire du jour est clairement en dessous, la séance manque de piquant."; } },
    { id:"surentrainement", w:8, label:"⚠️ Surentraînement", apply:(ns)=>{ ns.energie=clamp(ns.energie-10,0,100); ns.health=clamp(ns.health-5,0,100); ns.mentalFatigue=clamp((ns.mentalFatigue||0)+rand(4,8),0,100); return "Tu en as trop demandé à ton corps cette semaine, la fatigue s'accumule dangereusement."; } },
    { id:"plateau", w:10, label:"📉 Plateau de progression", apply:()=>{ return "Tu stagnes cette semaine : aucune progression notable malgré les efforts."; } },
    { id:"malade", w:6, label:"🤒 Grippe", apply:(ns)=>{ ns.injuredTurns=Math.max(ns.injuredTurns||0,1); ns.health=clamp(ns.health-8,0,100); return "Une grippe carabinée t'oblige à lever le pied quelques jours."; } },
    { id:"sommeil", w:8, label:"😴 Mauvais sommeil", apply:(ns)=>{ ns.moral=clamp(ns.moral-2,0,100); ns.energie=clamp(ns.energie-2,0,100); return "Les nuits sont courtes en ce moment, la récupération s'en ressent."; } },
    { id:"parfaite", w:5, label:"✨ Préparation parfaite", apply:(ns)=>{ addSkillAll(ns,0.6*DIFFICULTY.skillGainMult); ns.moral=clamp(ns.moral+4,0,100); ns.cardio=clamp((ns.cardio||0)+0.6,0,100); return "Semaine idéale à tous les niveaux : technique, cardio et mental progressent ensemble."; } },
    { id:"coach_absent", w:6, label:"🧑‍🏫 Coach principal absent", apply:()=>{ return "Ton coach principal est retenu ailleurs cette semaine, l'encadrement est réduit."; } },
  ];
  function rollTrainingVariance(ns){
    if (Math.random() >= 0.42) return null; // la plupart des semaines restent des semaines normales
    const total = TRAINING_VARIANCE.reduce((a,e)=>a+e.w,0);
    let r = Math.random()*total, chosen = TRAINING_VARIANCE[TRAINING_VARIANCE.length-1];
    for (const e of TRAINING_VARIANCE){ r -= e.w; if (r<=0){ chosen = e; break; } }
    const line = chosen.apply(ns);
    return `${chosen.label} — ${line}`;
  }

  // ---- Surcharge d'entraînement : chaque semaine non blessée, le joueur choisit une intensité.
  // Plus l'intensité est forte, plus le gain de compétence est élevé, mais plus la "Charge de
  // travail hebdomadaire" (jauge cumulative, décroissante avec le temps) grimpe — et au-delà d'un
  // seuil, le risque de blessure localisée et la fatigue mentale augmentent de façon exponentielle,
  // pour forcer un vrai arbitrage entre pic de forme (Peak Performance) et surentraînement (Burnout). ----
  const TRAINING_INTENSITIES = [
    { id:"leger", label:"🌿 Léger", short:"Charge basse, progression lente mais sûre.", loadPoints:8, skillMult:0.55, healthCost:0, energyCost:1, mentalFatigueMult:0.5 },
    { id:"normal", label:"⚙️ Normal", short:"Rythme standard, équilibre risque/progression.", loadPoints:18, skillMult:1.0, healthCost:2, energyCost:6, mentalFatigueMult:1.0 },
    { id:"intense", label:"🔥 Intense", short:"Charge de travail élevée : progression rapide, mais risque de blessure et de burnout en forte hausse.", loadPoints:34, skillMult:1.65, healthCost:7, energyCost:14, mentalFatigueMult:1.9 },
  ];
  function trainingIntensityById(id){ return TRAINING_INTENSITIES.find(t=>t.id===id) || TRAINING_INTENSITIES[1]; }
  // Le seuil de "surcharge" est fixé à 60 : en dessous, le risque additionnel est nul. Au-delà,
  // il grimpe au carré (exponentiel) jusqu'à un plafond aux alentours de la jauge pleine (100).
  function overloadRiskMult(load){
    const over = Math.max(0, (load||0) - 60) / 40;
    return 1 + Math.pow(over, 2) * 2.6; // jusqu'à x3.6 environ à charge = 100
  }
  function overloadMentalMult(load){
    const over = Math.max(0, (load||0) - 60) / 40;
    return 1 + Math.pow(over, 2) * 1.8;
  }
  function overloadInjuryChance(load){
    const over = Math.max(0, (load||0) - 60) / 40;
    return Math.min(0.35, Math.pow(over, 2) * 0.32); // jusqu'à 32% de risque de blessure localisée à charge max
  }

  // Une semaine de repos/entraînement — les organisations tournent chaque semaine, donc le joueur
  // peut enchaîner autant de semaines de récupération/travail qu'il le souhaite avant de recombattre.
  function resolveRest(s, intensityId){
    const gym = currentGym(s);
    const healthRegenBonus = staffEffect(s.hiredStaff, "healthRegen");
    const moralBonus = staffEffect(s.hiredStaff, "moralBonus");
    let ns = { ...s };
    const wasInjured = (s.injuredTurns||0) > 0;
    const intensity = wasInjured ? null : trainingIntensityById(intensityId || "normal");
    ns = advanceCalendarWeeks(ns, 1);
    // ---- Charge de travail hebdomadaire : jauge cumulative qui décroît naturellement chaque semaine
    // (comme une fatigue chronique) mais grimpe avec l'intensité choisie. Une convalescence la fait
    // retomber plus vite (repos forcé). ----
    ns.weeklyLoad = wasInjured
      ? clamp((s.weeklyLoad||0) * 0.55, 0, 130)
      : clamp((s.weeklyLoad||0) * 0.72 + intensity.loadPoints, 0, 130);
    const loadMentalMult = overloadMentalMult(ns.weeklyLoad);
    ns.health = clamp(ns.health + 4*gym.heal + healthRegenBonus*0.4 - (intensity ? intensity.healthCost : 0), 0, 100);
    // Récupération d'énergie volontairement lente : il faut plusieurs semaines de repos pour repartir à fond.
    const energieRegen = (2.6 + (s.moral-70)*0.06) * gym.heal - (intensity ? intensity.energyCost : 0);
    ns.energie = clamp(ns.energie + energieRegen, 0, 100);
    if (!wasInjured){
      addSkillAll(ns, (0.22*gym.skill*coachFactor(s) + staffEffect(s.hiredStaff,"skillBonus")*0.12) * DIFFICULTY.skillGainMult * intensity.skillMult);
      ns.cardio = clamp((ns.cardio||0) + 0.28*gym.skill*intensity.skillMult + staffEffect(s.hiredStaff,"cardioBonus")*0.3, 0, 100);
      ns.mental = clamp((ns.mental||0) + 0.18 + staffEffect(s.hiredStaff,"mentalBonus")*0.3, 0, 100);
      ns.chin = clamp((ns.chin||0) + staffEffect(s.hiredStaff,"chinBonus")*0.3, 0, 100);
      ns.weeksTrained = (s.weeksTrained||0) + 1;
    }
    ns.moral = clamp(ns.moral + 1.5 + moralBonus*0.4 + persistentSum(s,"moralWeekly"), 0, 100);
    if (ns.injuredTurns>0) ns.injuredTurns -= 1;
    // ---- Fatigue mentale : s'accumule doucement avec le rythme des camps, se résorbe pendant les
    // semaines de convalescence et davantage si le moral est haut (esprit détendu, mieux disposé).
    // Au-delà du seuil de surcharge, la fatigue mentale accumulée grimpe de façon exponentielle. ----
    ns.mentalFatigue = wasInjured
      ? clamp((s.mentalFatigue||0) - rand(3,6), 0, 100)
      : clamp((s.mentalFatigue||0) + (rand(1,3) * intensity.mentalFatigueMult * loadMentalMult) - (ns.moral>=75 ? rand(1,3) : 0), 0, 100);
    let lines = [wasInjured
      ? `🩺 Semaine de convalescence à la ${gym.name} (${ns.injuredTurns} semaine${ns.injuredTurns>1?"s":""} restante${ns.injuredTurns>1?"s":""}).`
      : `💤 Semaine d'entraînement (${intensity.label}) à la ${gym.name}.`];
    // ---- Surentraînement (Overreaching/Overtraining) : une fois la charge au-delà du seuil, chaque
    // semaine expose à un risque croissant (au carré) de blessure localisée liée à la fatigue accumulée. ----
    if (!wasInjured){
      const injuryChance = overloadInjuryChance(ns.weeklyLoad);
      if (injuryChance > 0 && Math.random() < injuryChance){
        const li = rollLocalizedInjury();
        li.weeksLeft = Math.max(1, Math.round(li.weeksLeft * 0.55));
        ns.localizedInjuries = [...(ns.localizedInjuries||[]).filter(x=>x.id!==li.id), li];
        ns.injuredTurns = Math.max(ns.injuredTurns||0, li.weeksLeft);
        ns.injuryCount = (s.injuryCount||0) + 1;
        lines.push(`⚠️ Surentraînement : la charge de travail accumulée (${Math.round(ns.weeklyLoad)}/100) finit par te coûter cher — ${li.icon} ${li.label} (environ ${li.weeksLeft} semaine${li.weeksLeft>1?"s":""} de gêne).`);
      } else if (ns.weeklyLoad >= 85){
        lines.push(`⚠️ Charge de travail critique (${Math.round(ns.weeklyLoad)}/100) : le risque de blessure et de burnout augmente fortement si tu ne lèves pas le pied.`);
      } else if (ns.weeklyLoad >= 60){
        lines.push(`📈 Charge de travail élevée (${Math.round(ns.weeklyLoad)}/100) : la progression s'accélère, mais le risque commence à grimper.`);
      }
    }
    if (!wasInjured){
      const varianceLine = rollTrainingVariance(ns);
      if (varianceLine) lines.push(varianceLine);
    }
    if (!wasInjured && Math.random() < 0.07){
      ns.techPoints = (ns.techPoints||0) + 1;
      lines.push(`🧠 Séance studieuse et productive : +1 point de technique (à dépenser dans l'onglet Techniques).`);
    }
    if ((ns.mentalFatigue||0) >= 80 && (s.mentalFatigue||0) < 80){
      lines.push(`🧠 Fatigue mentale critique : ton esprit est épuisé par l'enchaînement des camps et des combats. Une semaine en famille ferait le plus grand bien avant le prochain combat.`);
    }
    // ---- Équipe d'entraînement vivante : les partenaires progressent, partent, ou percent ailleurs ----
    const tp = tickTrainingPartners(ns, 1);
    ns = tp.ns;
    lines.push(...tp.lines);
    // ---- Classement mondial dynamique : les organisations où le joueur est classé continuent de vivre ----
    Object.keys(ns.orgRanks||{}).forEach(orgId=>{
      const org = ORGS.find(o=>o.id===orgId);
      if (!org) return;
      const rankBefore = ns.orgRanks[orgId];
      ns = simulateRankingTick(ns, org);
      if (rankBefore > 0 && ns.orgRanks[orgId] > rankBefore){
        lines.push(`📉 Un concurrent réalise une grosse performance : tu recules au #${ns.orgRanks[orgId]} du classement ${org.name} sans avoir combattu.`);
      }
    });
    // ---- Classement mondial (Top 50 P4P) : vit chaque semaine, vétérans et prospects inclus ----
    {
      const g = simulateGlobalRankingTick(ns);
      ns = g.ns;
      lines.push(...g.lines);
    }
    const fin = applyLivingCosts(ns);
    ns = fin.ns;
    if (fin.debtIncurred) lines.push(`💸 Le budget est serré cette semaine, ta dette augmente (${eur(ns.dette)}).`);
    if (fin.equipmentNote) lines.push(fin.equipmentNote);
    // ---- Réseaux sociaux : nouvelle semaine, nouveaux posts possibles ; la polémique retombe doucement ----
    ns.socialPostsThisWeek = 0;
    ns.socialControversy = clamp((ns.socialControversy||0) * 0.9, 0, 100);
    // ---- Vie personnelle : une vie continue de se dérouler en dehors de la cage ----
    const lifeLine = maybeRollLifeEvent(ns);
    if (lifeLine) lines.push(lifeLine);
    return { ns, lines };
  }

  function learnTechnique(t){
    const cost = techniqueCost(t);
    if ((state.techPoints||0) < cost) return;
    if (state.discoveredTechniques.includes(t.id)) return;
    const ns = { ...state, techPoints: state.techPoints - cost, discoveredTechniques: [...state.discoveredTechniques, t.id] };
    setState(ns);
    pushLog(`🥋 Technique apprise grâce à tes points : "${t.name}" (coût ${cost} pt${cost>1?"s":""}).`);
  }

  // ---- Arbre passif : perks permanents achetés avec les points de technique, indépendants des
  // techniques actives (sauna d'endurance, résilience mentale, sens du show). ----
  function buyPassivePerk(perkId){
    const perk = PASSIVE_PERKS.find(p=>p.id===perkId);
    if (!perk) return;
    if ((state.techPoints||0) < perk.cost) return;
    if ((state.passivePerks||[]).includes(perkId)) return;
    const ns = { ...state, techPoints: state.techPoints - perk.cost, passivePerks: [...(state.passivePerks||[]), perkId] };
    setState(ns);
    pushLog(`🌟 Perk passif débloqué : "${perk.label}" (coût ${perk.cost} pts).`);
  }

  function chooseOption(opt){
    if (opt.type === "fight"){
      const result = resolveFight(opt, state);
      let ns = result.ns;
      const milestone = checkMilestones(ns);
      ns = milestone.ns;
      setState(ns);
      result.lines.forEach(pushLog);
      milestone.lines.forEach(pushLog);
      setPendingFightResult(result.summary);
      setPhase("fight-result");
      return;
    }

    const prevLevels = computeLevels(state);
    const result = resolveRest(state, opt.intensity);
    const ns = result.ns;
    setState(ns);
    result.lines.forEach(pushLog);
    const levelUps = detectLevelUps(prevLevels, computeLevels(ns));
    if (levelUps.length){
      levelUps.forEach(u => pushLog(u.dir==="up" ? `📊 Niveau supérieur en ${u.label} : ${u.from} → ${u.to} (${u.levelName}) !` : `📉 Niveau inférieur en ${u.label} : ${u.from} → ${u.to} (${u.levelName})...`));
      triggerLevelUpToast(levelUps);
    }

    if (ns.age >= 50){
      pushLog(`🔚 ${name} atteint 50 ans : retraite obligatoire.`);
      const milestone = checkMilestones({ ...ns, careerOver:true });
      milestone.lines.forEach(pushLog);
      setState(milestone.ns);
      setPhase("gameover");
      return;
    }
    advance(ns);
  }

  function continueAfterFightResult(){
    const summary = pendingFightResult;
    setPendingFightResult(null);
    if (!summary) return;
    const ns = summary.ns;
    if (ns.age >= 50){
      pushLog(`🔚 ${name} atteint 50 ans : retraite obligatoire.`);
      const milestone = checkMilestones({ ...ns, careerOver:true });
      milestone.lines.forEach(pushLog);
      setState(milestone.ns);
      setPhase("gameover");
      return;
    }
    // ---- Conférence de presse d'après-combat : quasi systématique pour un combat de titre (85%),
    // fréquente sinon (50%). Se déclenche avant le reste de l'enchaînement post-combat. ----
    const pfChance = summary.isTitle ? 0.85 : 0.5;
    if (Math.random() < pfChance){
      setState(ns);
      setPendingPostFightChain({ ns, summary });
      setPendingPostPresser({ win: summary.win, opponent: summary.opponent, isTitle: summary.isTitle });
      setPhase("fight-postpresser");
      return;
    }
    continueAfterFightChain(ns, summary);
  }

  function pickPostFightPresser(choice){
    const ctx = pendingPostPresser;
    const chain = pendingPostFightChain;
    setPendingPostPresser(null);
    setPendingPostFightChain(null);
    if (!ctx || !chain) return;
    const r = resolvePostFightPresser(choice);
    let ns = { ...chain.ns };
    ns.hype = clamp((ns.hype||20) + r.hypeDelta, 0, 100);
    ns.aura = clamp((ns.aura||0) + r.auraDelta, 0, 100);
    ns.moral = clamp(ns.moral + r.moralDelta, 0, 100);
    pushLog(r.success
      ? `🎙️ Conférence d'après-combat : "${choice.label}" — bien reçu par les médias.`
      : `🎙️ Conférence d'après-combat : "${choice.label}" — ${r.failLine}`);
    setState(ns);
    continueAfterFightChain(ns, chain.summary);
  }

  function continueAfterFightChain(ns, summary){
    if (summary.coachDecision){
      setState(ns);
      setPendingCoachContext(summary.coachDecision);
      setPhase("coach-decision");
      return;
    }
    // ---- Feud sur les réseaux sociaux : un autre combattant s'en prend à toi après ce combat.
    // Plus probable si le combat vient d'un rival ou si le hype est déjà élevé. ----
    const feudChance = (ns.lastFight?.isRival ? 0.32 : 0) + clamp(((ns.hype||20)-30)*0.006, 0, 0.22);
    if (ns.lastFight && Math.random() < feudChance){
      const template = FEUD_COMMENT_TEMPLATES[randInt(0, FEUD_COMMENT_TEMPLATES.length-1)];
      const commenterName = ns.lastFight.isRival ? ns.lastFight.opponent : randName(ns.gender);
      setState(ns);
      setPendingFeud({ commenterName, line: template.replace(/\{player\}/g, name.split(" ")[0]||"Toi") });
      setPhase("feud");
      return;
    }
    // ---- Happenings liés aux combats : désormais, un "évènement de vie" ne peut plus surgir
    // dans le menu principal — il n'apparaît que dans la foulée d'un combat, comme conséquence
    // directe de ce qui vient de se passer sur/autour de l'octogone. ----
    if (Math.random() < 0.24){
      const condPool = EVENTS.filter(e => !e.cond || e.cond(ns));
      const freshPool = condPool.filter(e => !ns.recentEventIds.includes(e.prompt));
      const finalPool = freshPool.length ? freshPool : (condPool.length ? condPool : EVENTS);
      const ev = pickWeightedEvent(finalPool);
      setState(ns);
      setPendingEvent(ev);
      setPhase("event");
      return;
    }
    advance(ns);
  }

  function pickFeudReply(replyId){
    const r = resolveFeudReply(replyId);
    let ns = applyDelta({ ...state }, r.d);
    ns.socialControversy = clamp((state.socialControversy||0) + r.controversy, 0, 100);
    ns.hype = clamp((state.hype||20) + r.hypeGain, 0, 100);
    ns.feudTarget = pendingFeud.commenterName;
    ns.feudHeat = clamp((state.feudHeat||0) + r.feudHeat, 0, 100);
    pushLog(`⚔️ Réponse à ${pendingFeud.commenterName} : ${r.desc}`);
    setState(ns);
    setPendingFeud(null);
    if (Math.random() < 0.24){
      const condPool = EVENTS.filter(e => !e.cond || e.cond(ns));
      const freshPool = condPool.filter(e => !ns.recentEventIds.includes(e.prompt));
      const finalPool = freshPool.length ? freshPool : (condPool.length ? condPool : EVENTS);
      const ev = pickWeightedEvent(finalPool);
      setPendingEvent(ev);
      setPhase("event");
      return;
    }
    advance(ns);
  }

  function resolveCoachDecision(action){
    const ctx = pendingCoachContext;
    setPendingCoachContext(null);
    const currentCoach = headCoachById(state.headCoachId);
    let ns = { ...state };
    if (action === "keep"){
      ns.coachRelation = clamp(ns.coachRelation + (ctx==="win"?10:6), 0, 100);
      pushLog(ctx==="win"
        ? `🤝 Tu renouvelles ta confiance à ${currentCoach.name} après cette belle victoire.`
        : `🤝 Malgré la série de défaites, tu choisis de continuer avec ${currentCoach.name}.`);
    } else {
      ns.headCoachId = "coach_debutant";
      ns.coachRelation = 50;
      pushLog(`👋 Fin de collaboration avec ${currentCoach.name}. Tu repars avec un coach de quartier — pense à en recruter un nouveau via l'onglet Coach.`);
    }
    setState(ns);
    if (ns.age >= 50){
      pushLog(`🔚 ${name} atteint 50 ans : retraite obligatoire.`);
      const milestone = checkMilestones({ ...ns, careerOver:true });
      milestone.lines.forEach(pushLog);
      setState(milestone.ns);
      setPhase("gameover");
      return;
    }
    advance(ns);
  }

  // Les happenings ont désormais un vrai poids sur la carrière : leurs effets sont amplifiés
  // par rapport aux valeurs "brutes" définies dans EVENTS, pour que chaque choix compte vraiment.
  const EVENT_IMPACT_MULT = 1.7;
  function amplifyDelta(d){
    const nd = { ...d };
    ["skill","reputation","moral","coachRelation","cardio","mental","chin","aura","hype","energie","health"].forEach(k=>{
      if (nd[k]) nd[k] = Math.round(nd[k]*EVENT_IMPACT_MULT*10)/10;
    });
    if (nd.skillFocus) nd.skillFocus = { ...nd.skillFocus, amount: Math.round(nd.skillFocus.amount*EVENT_IMPACT_MULT*10)/10 };
    return nd;
  }
  function resolveEvent(choice){
    const prevLevels = computeLevels(state);
    const { d, result } = choice.effect(state);
    const ad = amplifyDelta(d);
    let ns = { ...state };
    ns = applyDelta(ns, ad);
    ns.recentEventIds = [...state.recentEventIds.slice(-8), pendingEvent.prompt];
    setState(ns);
    pushLog(`💬 ${result}`);
    if (ad.injuredTurns) pushLog(`🩹 Conséquence directe : ${ad.injuredTurns} semaine${ad.injuredTurns>1?"s":""} d'arrêt forcé.`);
    if (ad.contractBreak) pushLog(`📄 Ton contrat en cours prend fin suite à cet événement.`);
    if (ad.sponsorWeekly) pushLog(`🤝 Nouveau revenu récurrent : +${eur(ad.sponsorWeekly)}/semaine pendant ${ad.sponsorWeeks||20} semaines.`);
    const levelUps = detectLevelUps(prevLevels, computeLevels(ns));
    if (levelUps.length){
      levelUps.forEach(u => pushLog(u.dir==="up" ? `📊 Niveau supérieur en ${u.label} : ${u.from} → ${u.to} (${u.levelName}) !` : `📉 Niveau inférieur en ${u.label} : ${u.from} → ${u.to} (${u.levelName})...`));
      triggerLevelUpToast(levelUps);
    }
    setPendingEvent(null);
    advance(ns);
  }

  function acceptContract(){
    const { org, fights, bonus, perFightMin, winBonus, titleBonus, renewal, titleClause, titleClauseStreak } = pendingContract;
    let ns = { ...state };
    ns.money += bonus;
    const changedOrg = !renewal && ns.justEndedContractOrg && ns.justEndedContractOrg.id !== org.id;
    ns.contract = { orgId: org.id, orgName: org.name, fightsRemaining: fights, perFightMin, winBonus, titleBonus, titleClause: !!titleClause, titleClauseStreak: titleClauseStreak||3, titleClauseUsed:false };
    ns.contractWins = 0;
    ns.contractFightsTotal = 0;
    if (changedOrg) pushLog(`🔀 Changement d'organisation : après ${ns.justEndedContractOrg.name}, direction ${org.name}.`);
    ns.justEndedContractOrg = null;
    pushLog(`📄 ${renewal ? "Renouvellement" : "Signature"} avec ${org.name} : ${fights} combats, prime à la signature de ${eur(bonus)}, minimum garanti ${eur(perFightMin)}/combat, prime de victoire ${eur(winBonus)}, prime de titre ${eur(titleBonus)}.${titleClause ? " Clause de titre garanti après 3 victoires." : ""}`);
    setState(ns);
    setPendingContract(null);
    generateFightTurn(ns);
  }

  // ---- Négociation : jusqu'à 2 tentatives par offre, chacune avec une chance de succès ; en cas
  // d'échec quand l'organisation était déjà peu convaincue, elle peut retirer son offre. ----
  function negotiateContract(optionId){
    const org = pendingContract.org;
    const chance = negotiationSuccessChance(org, state);
    const success = Math.random()*100 < chance;
    const interestPct = contractChance(org, state);
    if (!success){
      const withdraw = interestPct < 40 && Math.random() < 0.25;
      if (withdraw){
        pushLog(`📄 ${org.name} retire son offre — la négociation a trop tendu la discussion.`);
        setPendingContract(null);
        generateFightTurn(state);
        return;
      }
      pushLog(`📄 ${org.name} refuse cette demande, mais l'offre initiale tient toujours.`);
      setPendingContract({ ...pendingContract, negotiationsLeft: pendingContract.negotiationsLeft - 1 });
      return;
    }
    let updated = { ...pendingContract, negotiationsLeft: pendingContract.negotiationsLeft - 1 };
    if (optionId === "plus_garanti"){
      updated.perFightMin = Math.round(updated.perFightMin*1.35/100)*100;
      updated.winBonus = Math.round(updated.winBonus*0.7/100)*100;
      pushLog(`📄 ${org.name} accepte de monter le minimum garanti, contre une prime de victoire réduite.`);
    } else if (optionId === "plus_combats"){
      updated.fights = updated.fights + 2;
      updated.bonus = Math.round(updated.bonus*0.75/100)*100;
      pushLog(`📄 ${org.name} accepte d'allonger le contrat de 2 combats, contre une prime à la signature réduite.`);
    } else if (optionId === "clause_titre"){
      updated.titleClause = true;
      updated.titleClauseStreak = 3;
      updated.bonus = Math.round(updated.bonus*0.85/100)*100;
      updated.perFightMin = Math.round(updated.perFightMin*0.9/100)*100;
      pushLog(`📄 ${org.name} accepte la clause de titre garanti après 3 victoires, contre une bourse globale un peu réduite.`);
    }
    setPendingContract(updated);
  }

  function declineContract(){
    pushLog(`📄 Offre de ${pendingContract.org.name} déclinée — tu restes agent libre.`);
    setPendingContract(null);
    generateFightTurn(state);
  }

  function breakContract(){
    if (!state.contract) return;
    const fee = state.contract.perFightMin * 1.5;
    if (state.money < fee) { pushLog(`Fonds insuffisants pour rompre le contrat (${eur(fee)} requis).`); return; }
    let ns = { ...state, money: state.money - fee, reputation: clamp(state.reputation-6,0,100), contract: null };
    pushLog(`✂️ Rupture anticipée du contrat avec ${state.contract.orgName} contre ${eur(fee)}.`);
    setState(ns);
    generateFightTurn(ns);
  }

  function retireNow(){
    pushLog(`🔚 ${name} annonce sa retraite à ${state.age} ans.`);
    const milestone = checkMilestones({ ...state, careerOver:true });
    milestone.lines.forEach(pushLog);
    setState(milestone.ns);
    setPhase("gameover");
  }

  function changeGym(g){
    if (state.money < g.cost) return;
    setState(s => ({ ...s, money: s.money - g.cost, gymId: g.id, coachRelation: 55 }));
    pushLog(`🏋️ Changement de camp d'entraînement : ${g.name}. Nouvelle alchimie à construire avec le staff.`);
    closePanel();
  }

  // ---- Patrimoine : achat définitif d'un investissement (salle de sport personnelle, équipe
  // médicale dédiée...). Contrairement au changement de camp, cet actif reste acquis pour toujours. ----
  function buyInvestment(id){
    const inv = investmentById(id);
    if (!inv || state.money < inv.cost || hasInvestment(state, id)) return;
    setState(s => ({ ...s, money: s.money - inv.cost, investments: [...(s.investments||[]), id] }));
    pushLog(`💼 Investissement réalisé : "${inv.label}" (${eur(inv.cost)}). ${inv.desc}`);
  }

  function payDebt(){
    if (!state || state.dette<=0) return;
    const pay = Math.min(state.money, state.dette);
    if (pay<=0){ pushLog("Fonds insuffisants pour rembourser la dette."); return; }
    const ns = { ...state, money: state.money-pay, dette: state.dette-pay };
    pushLog(`💳 Remboursement de ${eur(pay)} sur la dette (reste ${eur(ns.dette)}).`);
    setState(ns);
  }

  // ---- Vérifie, après un combat ou à la retraite, si de nouveaux records ou de grands objectifs
  // de carrière viennent d'être atteints. Retourne un nouvel état (recordsBroken/objectivesCompleted
  // mis à jour) ainsi que les lignes de log/toast à afficher. ----
  function checkMilestones(ns){
    let lines = [];
    let broken = [...(ns.recordsBroken||[])];
    RECORDS.forEach(r=>{
      if (broken.includes(r.id)) return;
      if (r.value(ns) >= r.target){
        broken.push(r.id);
        ns.reputation = clamp((ns.reputation||0) + 5, 0, 100);
        ns.hype = clamp((ns.hype||0) + 8, 0, 100);
        ns.aura = clamp((ns.aura||0) + 4, 0, 100);
        const displayVal = r.isMoney ? eur(r.value(ns)) : `${r.value(ns)} ${r.unit}`;
        lines.push(`🏅 RECORD BATTU ! ${r.label} : ${displayVal} — tu inscris ton nom dans l'histoire du circuit.`);
      }
    });
    ns.recordsBroken = broken;
    let done = [...(ns.objectivesCompleted||[])];
    OBJECTIVES.forEach(o=>{
      if (done.includes(o.id)) return;
      if (o.check(ns)){
        done.push(o.id);
        lines.push(`🎯 OBJECTIF ACCOMPLI : ${o.label} !`);
      }
    });
    ns.objectivesCompleted = done;
    return { ns, lines };
  }

  function computeScore(s){
    const total = s.wins + s.losses;
    const winRate = total ? s.wins/total : 0;
    const titlePts = Math.min(s.titles, 5) * 8;
    const winPts = winRate * 25;
    const repPts = (s.reputation/100) * 15;
    const moneyPts = Math.min(s.money/2000000, 1) * 10;
    const healthPts = (s.health/100) * 10;
    const debtPts = Math.min((s.dette||0)/60000, 1) * 8;
    const total100 = Math.round(clamp(titlePts+winPts+repPts+moneyPts+healthPts-debtPts, 0, 100));
    return { total100, winRate, titlePts, winPts, repPts, moneyPts, healthPts, debtPts };
  }

  function rankLabel(score){
    if (score>=90) return "Légende du MMA";
    if (score>=75) return "Champion reconnu";
    if (score>=60) return "Solide carrière";
    if (score>=40) return "Carrière correcte";
    if (score>=20) return "Carrière discrète";
    return "Carrière vite oubliée";
  }
  function legacyLabel(score, s){
    if (score>=90 && s.titles>=2) return "Légende du MMA — nom gravé dans l'histoire du sport";
    if (score>=90) return "Légende du MMA";
    if (score>=75) return "Superstar internationale du circuit";
    if (score>=60) return "Champion établi, respecté partout où il est passé";
    if (score>=45) return "Combattant confirmé au niveau mondial";
    if (score>=28) return "Prétendant sérieux, carrière solide au niveau national";
    if (score>=15) return "Combattant régional, un parcours honnête";
    return "Carrière modeste, vite oubliée du grand public";
  }

  // ---- Système de legacy (héritage) : détermine si le combattant est une simple star,
  // une légende, ou LE GOAT, à partir de son palmarès complet. ----
  function computeLegacyScore(s){
    const titles = s.titles||0;
    const defenses = s.titleDefenses||0;
    const legendWins = s.legendWins||0;
    const streak = s.longestWinStreak||0;
    const finishes = (s.koWins||0)+(s.tkoWins||0)+(s.subWins||0);
    const orgsCount = new Set(s.titlesWonOrgs||[]).size;
    const raw = titles*11 + defenses*5 + legendWins*7 + Math.min(streak,15)*2 + Math.min(finishes,40)*1.1 + Math.min(orgsCount,6)*4;
    const legacy100 = Math.round(clamp(raw, 0, 100));
    let tier = "Simple star du circuit";
    if (legacy100>=85) tier = "🐐 Le GOAT (Greatest Of All Time)";
    else if (legacy100>=62) tier = "Légende du sport";
    else if (legacy100>=35) tier = "Star confirmée";
    return { legacy100, tier, titles, defenses, legendWins, streak, finishes, orgsCount };
  }

  // ---------- RENDER ----------

  if (phase === "intro"){
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
        <style>{BOUNCE_STYLE}</style>
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="text-xs tracking-widest text-red-500 font-bold mb-2">SIMULATEUR</div>
            <h1 className="text-5xl font-black uppercase italic tracking-tight leading-none mb-2">Cage<span className="text-red-500">.</span>Carrière</h1>
            <p className="text-zinc-400 text-sm">18 ans. Une salle de quartier. Un rêve d'octogone.</p>
          </div>
          {pendingSave && (
            <div className="bg-zinc-900 border border-red-700 rounded-xl p-4 mb-4">
              <div className="text-xs uppercase tracking-widest text-red-500 font-bold mb-2">💾 Partie en cours trouvée</div>
              <div className="text-sm text-zinc-300 mb-3">
                {pendingSave.name || "Combattant"} · {pendingSave.state ? `${pendingSave.state.age} ans, ${pendingSave.state.wins||0}V-${pendingSave.state.losses||0}D` : ""}
                {pendingSave.phase === "gameover" ? " · carrière terminée" : ""}
              </div>
              <div className="flex gap-2">
                <button onClick={resumeSave} className={`${BTN} flex-1 bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-wide py-2.5 rounded-xl text-sm`}>
                  ▶️ Continuer
                </button>
                <button onClick={discardSave} className={`${BTN} bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2.5 rounded-xl text-xs uppercase tracking-wide`}>
                  Nouvelle partie
                </button>
              </div>
            </div>
          )}

          {hallOfFame.some(h=>h.fullState) && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4">
              <div className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-2">🏛️ Anciennes carrières terminées</div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {hallOfFame.filter(h=>h.fullState).slice(0,25).map((h,i)=>(
                  <button key={i} onClick={()=>viewArchivedEntry(h)}
                    className={`${BTN} w-full flex items-center justify-between text-left bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-lg px-3 py-2 text-xs`}>
                    <span className="text-zinc-300">{h.name} <span className="text-zinc-600">({h.wins}V-{h.losses}D, {h.titles} titre{h.titles>1?"s":""})</span></span>
                    <span className="text-yellow-400 font-semibold">{h.legacyScore} · {h.tier}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">Nom du combattant</label>
            <div className="flex gap-2 mb-4">
              <input
                value={name}
                onChange={e=>setName(e.target.value)}
                placeholder="Ex : Yanis Belkacem"
                className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
              <button onClick={generateRandomName} className={`${BTN} bg-zinc-800 hover:bg-zinc-700 px-3 rounded-xl text-xs uppercase tracking-wide`}>Aléatoire</button>
            </div>
            <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">Genre</label>
            <div className="flex gap-2 mb-4">
              <button onClick={()=>setGender("homme")} className={`${BTN} flex-1 rounded-xl px-3 py-2 text-sm font-semibold ${gender==="homme"?"bg-red-600 text-white":"bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>Homme</button>
              <button onClick={()=>setGender("femme")} className={`${BTN} flex-1 rounded-xl px-3 py-2 text-sm font-semibold ${gender==="femme"?"bg-red-600 text-white":"bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>Femme</button>
            </div>
            <button onClick={()=>{ if(name.trim()) setPhase("style"); }} className={`${BTN} w-full bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-wide py-3 rounded-xl`}>
              Continuer
            </button>
            <p className="text-zinc-600 text-xs mt-4">L'UFC n'ouvre ses portes qu'à 21 ans (réputation suffisante, ou contrat décroché via le Dana White's Contender Series). 20 organisations, 9 catégories de poids, un calendrier annuel semaine par semaine, un coach principal à recruter ou licencier, et 50 techniques à débloquer avec des points gagnés en carrière t'attendent.</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mt-4">
            <button onClick={()=>setShowRosterPanel(v=>!v)} className={`${BTN} w-full flex items-center justify-between text-left`}>
              <span className="text-xs uppercase tracking-widest text-zinc-400 font-bold">📋 Importer de vrais combattants (optionnel)</span>
              <span className="text-zinc-500 text-xs">{showRosterPanel ? "▲" : "▼"}</span>
            </button>
            {Object.keys(customRosters).length > 0 && (
              <div className="text-[11px] text-emerald-500 mt-2">
                {Object.values(customRosters).reduce((t,arr)=>t+arr.length,0)} combattant(s) chargé(s) pour {Object.keys(customRosters).length} organisation(s).
              </div>
            )}
            {showRosterPanel && (
              <div className="mt-3 space-y-3">
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Remplace une partie des adversaires générés aléatoirement par de vrais noms de combattants, organisation par organisation. Copie le prompt ci-dessous dans ton IA préférée (ChatGPT, Claude...), colle sa réponse ci-dessous, puis clique sur "Importer".
                </p>
                <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase tracking-widest text-zinc-500">Prompt à copier</span>
                    <button
                      onClick={()=>{ if(navigator.clipboard) navigator.clipboard.writeText(ROSTER_PROMPT_EXAMPLE); }}
                      className={`${BTN} text-[10px] uppercase tracking-wide bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded-lg`}>
                      Copier
                    </button>
                  </div>
                  <pre className="text-[10px] text-zinc-400 whitespace-pre-wrap">{ROSTER_PROMPT_EXAMPLE}</pre>
                </div>
                <textarea
                  value={rosterText}
                  onChange={e=>setRosterText(e.target.value)}
                  placeholder={"Colle ici la réponse de l'IA, ex :\nUFC: Nom 1, Nom 2, Nom 3\nBellator: Nom 4, Nom 5"}
                  rows={5}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-red-600"
                />
                <div className="flex gap-2">
                  <button onClick={()=>{ if(rosterText.trim()) importRosterText(rosterText); }}
                    className={`${BTN} flex-1 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-wide py-2 rounded-xl`}>
                    Importer le texte
                  </button>
                  <label className={`${BTN} flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold uppercase tracking-wide py-2 rounded-xl text-center cursor-pointer`}>
                    Importer un fichier
                    <input type="file" accept=".txt,.json" onChange={handleRosterFile} className="hidden" />
                  </label>
                </div>
                {Object.keys(customRosters).length > 0 && (
                  <button onClick={clearRosters} className={`${BTN} w-full bg-red-900 hover:bg-red-800 text-red-200 text-[10px] uppercase tracking-wide py-2 rounded-xl`}>
                    Effacer la liste importée
                  </button>
                )}
                {rosterImportMsg && <div className="text-[11px] text-zinc-400">{rosterImportMsg}</div>}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (phase === "style"){
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
        <style>{BOUNCE_STYLE}</style>
        <div className="max-w-md w-full">
          <div className="text-center mb-6">
            <div className="text-xs tracking-widest text-red-500 font-bold mb-2">{name}</div>
            <h2 className="text-2xl font-black uppercase italic">Choisis ton style</h2>
          </div>
          <div className="space-y-2">
            {STYLES.map(st=>(
              <button key={st.id} onClick={()=>{ setPendingStyle(st); setPhase("weightclass"); }}
                className={`${BTN} w-full text-left bg-zinc-900 border border-zinc-800 hover:border-red-600 rounded-xl p-4`}>
                <div className="font-bold text-lg mb-1">{st.name}</div>
                <div className="text-xs text-zinc-500">{st.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (phase === "weightclass" && pendingStyle){
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
        <style>{BOUNCE_STYLE}</style>
        <div className="max-w-md w-full">
          <div className="text-center mb-6">
            <div className="text-xs tracking-widest text-red-500 font-bold mb-2">{name} · {pendingStyle.name}</div>
            <h2 className="text-2xl font-black uppercase italic">Choisis ta catégorie de poids</h2>
            <p className="text-zinc-500 text-xs mt-2">Tu pourras monter ou descendre de catégorie plus tard, avec des risques et des bénéfices propres à chaque transition.</p>
          </div>
          <div className="space-y-2 max-h-[26rem] overflow-y-auto pr-1">
            {WEIGHT_CLASSES.map(wc=>(
              <button key={wc.id} onClick={()=>{ startCareer(pendingStyle, wc); setPendingStyle(null); }}
                className={`${BTN} w-full text-left bg-zinc-900 border border-zinc-800 hover:border-red-600 rounded-xl p-4`}>
                <div className="flex justify-between items-center">
                  <div className="font-bold text-lg">{wc.name}</div>
                  <div className="text-xs text-zinc-500">≤ {wc.limitKg} kg</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (phase === "event" && pendingEvent){
    const evRarity = eventRarity(pendingEvent);
    const rarityMeta = RARITY_META[evRarity] || RARITY_META.commun;
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
        <style>{BOUNCE_STYLE}</style>
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs uppercase tracking-widest text-red-500 font-bold">{pendingEvent.cat}</div>
            <div className={`text-[10px] uppercase tracking-widest font-bold border rounded-full px-2 py-0.5 ${rarityMeta.color}`}>{rarityMeta.label}</div>
          </div>
          <div className="text-lg font-semibold mb-5">{pendingEvent.prompt}</div>
          <div className="space-y-2">
            {pendingEvent.choices.map((c,i)=>(
              <button key={i} onClick={()=>resolveEvent(c)} className={`${BTN} w-full text-left bg-zinc-950 border border-zinc-800 hover:border-red-600 rounded-xl px-3 py-2 text-sm`}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (phase === "feud" && pendingFeud){
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
        <style>{BOUNCE_STYLE}</style>
        <div className="max-w-md w-full bg-zinc-900 border border-fuchsia-700 rounded-xl p-6">
          <div className="text-xs uppercase tracking-widest text-fuchsia-500 font-bold mb-2">📱 Guerre des mots sur les réseaux</div>
          <div className="text-sm text-zinc-400 mb-1">{pendingFeud.commenterName} publie :</div>
          <div className="text-base italic mb-5">{pendingFeud.line}</div>
          <div className="space-y-2">
            {FEUD_REPLIES.map(r=>(
              <button key={r.id} onClick={()=>pickFeudReply(r.id)} className={`${BTN} w-full text-left bg-zinc-950 border border-zinc-800 hover:border-fuchsia-600 rounded-xl px-3 py-2`}>
                <div className="font-semibold text-sm">{r.label}</div>
                <div className="text-xs text-zinc-500">{r.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (phase === "fight-rivalcontract" && pendingFight){
    const opt = pendingFight;
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
        <style>{BOUNCE_STYLE}</style>
        <div className="max-w-md w-full bg-zinc-900 border border-red-800 rounded-xl p-6">
          <div className="text-xs uppercase tracking-widest text-red-500 font-bold mb-1">🔥 Négociation de contrat — {rivalTrilogyLabel(opt.rivalMeetings) || "Rivalité"}</div>
          <div className="text-[11px] text-zinc-500 mb-4">Face à {opt.opponent}, ton agent te propose plusieurs types de clauses avant de signer pour ce combat.</div>
          <div className="space-y-2">
            {RIVAL_CLAUSES.map(c=>(
              <button key={c.id} onClick={()=>pickRivalClause(c.id)} className={`${BTN} w-full text-left bg-zinc-950 border border-zinc-800 hover:border-red-600 rounded-xl px-3 py-2`}>
                <div className="font-semibold text-sm">{c.label}</div>
                <div className="text-xs text-zinc-500">{c.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (phase === "fight-weightcut" && pendingFight){
    const opt = pendingFight;
    const dayLabel = opt.cutDay === 1 ? "J-3" : "J-2";
    const introLine = opt.cutDay === 1
      ? "Le camp d'entraînement se termine, la pesée approche à grands pas. Comment attaques-tu la coupe de poids ?"
      : "Dernier jour avant la pesée. Un dernier choix, décisif, avant de monter sur la balance.";
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
        <style>{BOUNCE_STYLE}</style>
        <div className="max-w-md w-full bg-zinc-900 border border-indigo-800 rounded-xl p-6">
          <div className="text-xs uppercase tracking-widest text-indigo-500 font-bold mb-1">Avant le combat · étape 1/4 — gestion du poids ({dayLabel})</div>
          <div className="text-[11px] text-zinc-500 mb-2">{opt.org.name}</div>
          <div className="font-bold text-xl mb-1">{name.split(" ")[0] || "Toi"} vs {opt.opponent}</div>
          {opt.opponentTag && <div className="text-xs text-yellow-500 mb-2">🐐 {opt.opponentTag}</div>}
          {opt.cutDay===2 && (opt.cutWaterAccum||0) > 0 &&
            <div className="text-xs text-indigo-400 mb-2">Eau perdue jusqu'ici : ~{(opt.cutWaterAccum||0).toFixed(1)} kg</div>}
          <div className="text-sm text-zinc-400 mb-4">{introLine}</div>
          <div className="space-y-2">
            {WEIGHT_CUT_ACTIONS.map(m=>(
              <button key={m.id} onClick={()=>pickCutDayAction(m.id)} className={`${BTN} w-full text-left bg-zinc-950 border border-zinc-800 hover:border-indigo-600 rounded-xl px-3 py-2`}>
                <div className="font-semibold text-sm">{m.label}</div>
                <div className="text-xs text-zinc-500">{m.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (phase === "fight-weightcut-rehydrate" && pendingFight){
    const opt = pendingFight;
    const hasNutri = (state.hiredStaff||[]).includes("nutritionniste");
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
        <style>{BOUNCE_STYLE}</style>
        <div className="max-w-md w-full bg-zinc-900 border border-indigo-800 rounded-xl p-6">
          <div className="text-xs uppercase tracking-widest text-indigo-500 font-bold mb-1">Avant le combat · étape 1/4 — réhydratation (J-1)</div>
          <div className="text-[11px] text-zinc-500 mb-2">{opt.org.name}</div>
          <div className="font-bold text-xl mb-1">{name.split(" ")[0] || "Toi"} vs {opt.opponent}</div>
          <div className="text-xs text-zinc-400 mb-3 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2">{opt.weighInResult}</div>
          <div className="text-sm text-zinc-400 mb-4">La pesée est passée. Il reste 24h pour récupérer avant de monter dans l'octogone.
            {hasNutri && <span className="text-emerald-400"> Ton nutritionniste est là pour t'aider.</span>}</div>
          <div className="space-y-2">
            <button onClick={()=>pickRehydration("intensive")} className={`${BTN} w-full text-left bg-zinc-950 border border-zinc-800 hover:border-indigo-600 rounded-xl px-3 py-2`}>
              <div className="font-semibold text-sm">💧 Réhydratation intensive (-400€)</div>
              <div className="text-xs text-zinc-500">Protocole complet (liquides, sels minéraux, repas ciblés) : récupère un maximum de tes attributs physiques, surtout avec un nutritionniste dans ton staff.</div>
            </button>
            <button onClick={()=>pickRehydration("standard")} className={`${BTN} w-full text-left bg-zinc-950 border border-zinc-800 hover:border-indigo-600 rounded-xl px-3 py-2`}>
              <div className="font-semibold text-sm">🥤 Réhydratation standard (gratuit)</div>
              <div className="text-xs text-zinc-500">Tu te contentes de boire et manger normalement : récupération plus limitée.</div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "fight-sponsor" && pendingFight){
    const opt = pendingFight;
    const offer = opt.shortSponsorOffer;
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
        <style>{BOUNCE_STYLE}</style>
        <div className="max-w-md w-full bg-zinc-900 border border-amber-700 rounded-xl p-6">
          <div className="text-xs uppercase tracking-widest text-amber-500 font-bold mb-1">Avant le combat — sponsor short</div>
          <div className="text-[11px] text-zinc-500 mb-2">{opt.org.name}</div>
          <div className="font-bold text-xl mb-1">{name.split(" ")[0] || "Toi"} vs {opt.opponent}</div>
          <div className="text-sm text-zinc-400 mb-4"><span className="font-semibold text-amber-400">{offer.brand}</span> te propose d'arborer son logo sur ton short pour ce combat.</div>
          <div className="text-xs text-zinc-400 space-y-0.5 mb-4">
            <div>Prime : {eur(offer.pay)}</div>
            <div>Condition : le combat doit durer au moins {offer.requiredRounds} round{offer.requiredRounds>1?"s":""} (sinon aucune prime).</div>
          </div>
          <div className="flex gap-2">
            <button onClick={()=>pickShortSponsor(true)} className={`${BTN} flex-1 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase text-sm py-2 rounded-xl`}>Signer</button>
            <button onClick={()=>pickShortSponsor(false)} className={`${BTN} flex-1 bg-zinc-800 hover:bg-zinc-700 font-bold uppercase text-sm py-2 rounded-xl`}>Décliner</button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "fight-trashtalk" && pendingFight){
    const opt = pendingFight;
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
        <style>{BOUNCE_STYLE}</style>
        <div className="max-w-md w-full bg-zinc-900 border border-fuchsia-800 rounded-xl p-6">
          <div className="text-xs uppercase tracking-widest text-fuchsia-500 font-bold mb-1">Avant le combat · étape 2/4 — conférence de presse</div>
          <div className="text-[11px] text-zinc-500 mb-2">{opt.org.name}</div>
          <div className="font-bold text-xl mb-1">{name.split(" ")[0] || "Toi"} vs {opt.opponent}</div>
          {opt.opponentTag && <div className="text-xs text-yellow-500 mb-2">🐐 {opt.opponentTag}</div>}
          {opt.city && <div className="text-[10px] text-zinc-500 mb-2">📍 {opt.city} · <span className={cardPositionColor(opt.cardKey)}>{opt.cardLabel}</span></div>}
          <div className="text-sm text-zinc-400 mb-4">Les caméras tournent, les médias t'attendent. Ce que tu dis là va peser lourd : hype, aura, moral, chances de victoire et même la bourse du combat en dépendent.</div>
          <div className="space-y-2">
            {TRASHTALK.map(tt=>(
              <button key={tt.id} onClick={()=>pickTrashtalk(tt)} className={`${BTN} w-full text-left bg-zinc-950 border border-zinc-800 hover:border-fuchsia-600 rounded-xl px-3 py-2`}>
                <div className="font-semibold text-sm">{tt.name}</div>
                <div className="text-xs text-zinc-500">{tt.desc}</div>
                <div className="text-[10px] text-fuchsia-500 mt-1 uppercase tracking-wide">Hype {tt.hype[0]>=0?"+":""}{tt.hype[0]} à +{tt.hype[1]} · Bourse jusqu'à x{tt.purseMult[1].toFixed(2)} · Risque {Math.round(tt.riskChance*100)}%</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (phase === "fight-trashtalk2" && pendingFight){
    const opt = pendingFight;
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
        <style>{BOUNCE_STYLE}</style>
        <div className="max-w-md w-full bg-zinc-900 border border-fuchsia-800 rounded-xl p-6">
          <div className="text-xs uppercase tracking-widest text-fuchsia-500 font-bold mb-1">Avant le combat · étape 3/4 — réplique</div>
          <div className="font-bold text-xl mb-1">{name.split(" ")[0] || "Toi"} vs {opt.opponent}</div>
          <div className="text-sm text-zinc-400 mb-4 italic">« {opt.trashLine} »</div>
          <div className="text-sm text-zinc-400 mb-4">L'adversaire vient de répliquer et la salle retient son souffle. Comment refermes-tu l'échange ?</div>
          <div className="space-y-2">
            {REBUTTALS.map(rb=>(
              <button key={rb.id} onClick={()=>pickRebuttal(rb)} className={`${BTN} w-full text-left bg-zinc-950 border border-zinc-800 hover:border-fuchsia-600 rounded-xl px-3 py-2`}>
                <div className="font-semibold text-sm">{rb.name}</div>
                <div className="text-xs text-zinc-500">{rb.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (phase === "fight-presser-incident" && pendingFight && pendingIncident){
    const opt = pendingFight;
    const inc = pendingIncident;
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
        <style>{BOUNCE_STYLE}</style>
        <div className="max-w-md w-full bg-zinc-900 border border-orange-700 rounded-xl p-6">
          <div className="text-xs uppercase tracking-widest text-orange-500 font-bold mb-1">Avant le combat · incident de dernière seconde</div>
          <div className="font-bold text-xl mb-1">{name.split(" ")[0] || "Toi"} vs {opt.opponent}</div>
          <div className="text-sm text-zinc-400 mb-4">🎥 {inc.label}</div>
          <div className="space-y-2">
            {inc.choices.map((c,i)=>(
              <button key={i} onClick={()=>pickIncidentChoice(c)} className={`${BTN} w-full text-left bg-zinc-950 border border-zinc-800 hover:border-orange-500 rounded-xl px-3 py-2`}>
                <div className="font-semibold text-sm">{c.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (phase === "fight-postpresser" && pendingPostPresser){
    const ctx = pendingPostPresser;
    const options = ctx.win ? POSTFIGHT_PRESSER_WIN : POSTFIGHT_PRESSER_LOSS;
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
        <style>{BOUNCE_STYLE}</style>
        <div className="max-w-md w-full bg-zinc-900 border border-purple-700 rounded-xl p-6">
          <div className="text-xs uppercase tracking-widest text-purple-500 font-bold mb-1">Après le combat · conférence de presse</div>
          <div className="font-bold text-xl mb-1">vs {ctx.opponent}</div>
          <div className="text-sm text-zinc-400 mb-4">
            {ctx.win ? "🎙️ Micro tendu, les journalistes attendent ta réaction à chaud." : "🎙️ Difficile, mais les journalistes veulent ta réaction après cette défaite."}
          </div>
          <div className="space-y-2">
            {options.map((c,i)=>(
              <button key={i} onClick={()=>pickPostFightPresser(c)} className={`${BTN} w-full text-left bg-zinc-950 border border-zinc-800 hover:border-purple-500 rounded-xl px-3 py-2`}>
                <div className="font-semibold text-sm">{c.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (phase === "fight-prepweek" && pendingFight){
    const opt = pendingFight;
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
        <style>{BOUNCE_STYLE}</style>
        <div className="max-w-md w-full bg-zinc-900 border border-red-800 rounded-xl p-6">
          <div className="text-xs uppercase tracking-widest text-red-500 font-bold mb-1">Avant le combat · semaine de préparation</div>
          <div className="text-[11px] text-zinc-500 mb-2">{opt.org.name}</div>
          <div className="font-bold text-xl mb-4">{name.split(" ")[0] || "Toi"} vs {opt.opponent}</div>
          <div className="text-sm text-zinc-400 mb-4">Il reste une semaine avant le combat. Comment la passes-tu ?</div>
          <div className="space-y-2">
            <button onClick={()=>pickPrepWeek("training")} className={`${BTN} w-full text-left bg-zinc-950 border border-zinc-800 hover:border-red-600 rounded-xl px-3 py-2`}>
              <div className="font-semibold text-sm">🏋️ Se concentrer sur l'entraînement</div>
              <div className="text-xs text-zinc-500">Derniers ajustements techniques : léger avantage pour le combat, mais moins de repos.</div>
            </button>
            <button onClick={()=>pickPrepWeek("interviews")} className={`${BTN} w-full text-left bg-zinc-950 border border-zinc-800 hover:border-red-600 rounded-xl px-3 py-2`}>
              <div className="font-semibold text-sm">🎙️ Multiplier les interviews</div>
              <div className="text-xs text-zinc-500">Bourse et hype en hausse grâce à la promo, au prix d'un peu de moral.</div>
            </button>
            <button onClick={()=>pickPrepWeek("famille")} className={`${BTN} w-full text-left bg-zinc-950 border border-zinc-800 hover:border-red-600 rounded-xl px-3 py-2`}>
              <div className="font-semibold text-sm">👨‍👩‍👧 Passer du temps en famille</div>
              <div className="text-xs text-zinc-500">Bon pour le moral, mais une préparation un peu moins pointue.</div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "fight-tactic" && pendingFight){
    const opt = pendingFight;
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
        <style>{BOUNCE_STYLE}</style>
        <div className="max-w-md w-full bg-zinc-900 border border-red-800 rounded-xl p-6">
          <div className="text-xs uppercase tracking-widest text-red-500 font-bold mb-1">Avant le combat · étape 4/4 — stratégie</div>
          <div className="text-[11px] text-zinc-500 mb-1">{opt.org.name} · {opt.org.region}</div>
          <div className="font-bold text-xl mb-1">{name.split(" ")[0] || "Toi"} vs {opt.opponent}</div>
          {opt.opponentTag && <div className="text-xs text-yellow-500 mb-2">🐐 {opt.opponentTag}</div>}
          <div className="text-xs text-sky-400 mb-1">🥊 Style adverse : {styleLabel(opt.oppStyleId)} — {opponentGameplanLine(opt.oppStyleId, null)}</div>
          {opt.city && <div className="text-[10px] text-zinc-500 mb-2">📍 {opt.city} · <span className={cardPositionColor(opt.cardKey)}>{opt.cardLabel}</span></div>}
          <div className="text-sm text-zinc-400 mb-4">Choisis ta stratégie pour ce combat :</div>
          <div className="space-y-2">
            {TACTICS.map(t=>{
              const edge = styleMatchupEdge(opt.oppStyleId, t.focus);
              return (
                <button key={t.id} onClick={()=>chooseTactic(t)} className={`${BTN} w-full text-left bg-zinc-950 border rounded-xl px-3 py-2 ${edge<0?"border-emerald-700 hover:border-emerald-500":edge>0?"border-red-800 hover:border-red-600":"border-zinc-800 hover:border-red-600"}`}>
                  <div className="font-semibold text-sm flex justify-between">
                    <span>{t.name}</span>
                    {edge<0 && <span className="text-[10px] text-emerald-400 uppercase">Avantage de style</span>}
                    {edge>0 && <span className="text-[10px] text-red-400 uppercase">Désavantage de style</span>}
                  </div>
                  <div className="text-xs text-zinc-500">{t.desc}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (phase === "fight-moment" && pendingMoment){
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
        <style>{BOUNCE_STYLE}</style>
        <div className="max-w-md w-full bg-zinc-900 border border-yellow-700 rounded-xl p-6">
          <div className="text-xs uppercase tracking-widest text-yellow-500 font-bold mb-1">Pendant le combat · moment décisif</div>
          {pendingFight && <div className="text-[11px] text-zinc-500 mb-3">{name.split(" ")[0] || "Toi"} vs {pendingFight.opponent} · Round {pendingFight.roundIndex}/{pendingFight.maxRoundPlanned}</div>}
          <div className="text-lg font-semibold mb-5">{pendingMoment.prompt}</div>
          <div className="space-y-2">
            {pendingMoment.choices.map((c,i)=>(
              <button key={i} onClick={()=>pickMomentChoice(c)} className={`${BTN} w-full text-left bg-zinc-950 border border-zinc-800 hover:border-yellow-600 rounded-xl px-3 py-2 text-sm`}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (phase === "fight-corner" && pendingFight){
    const opt = pendingFight;
    const cumulative = (opt.roundHistory||[]).reduce((a,h)=>a+h.delta,0);
    const flash = cumulative > 15 ? "Tu domines clairement sur les cartes, contrôle le rythme."
      : cumulative > 4 ? "Tu es légèrement devant sur les cartes, continue sur cette lancée."
      : cumulative < -15 ? "Tu es clairement mené aux points, il faut un geste fort !"
      : cumulative < -4 ? "Tu es légèrement mené, il va falloir hausser le rythme."
      : "Combat très équilibré, le prochain round peut tout changer.";
    const orders = [...CORNER_ORDERS];
    if ((opt.oppCuts||[]).length > 0) orders.push(CORNER_ORDER_TARGET_CUT);
    const cageBucket = cagePositionBucket(opt.cagePosScore||0);
    if (cageBucket === "avantage_adversaire") orders.push(CORNER_ORDER_RESET_POSITION);
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
        <style>{BOUNCE_STYLE}</style>
        <div className="max-w-md w-full bg-zinc-900 border border-sky-700 rounded-xl p-6">
          <div className="text-xs uppercase tracking-widest text-sky-500 font-bold mb-1">Entre les rounds · coin</div>
          <div className="text-[11px] text-zinc-500 mb-2">Fin du round {opt.roundIndex-1}/{opt.maxRoundPlanned} — {name.split(" ")[0] || "Toi"} vs {opt.opponent}</div>
          <div className={`text-[10px] font-semibold uppercase tracking-widest mb-2 ${cageBucket==="avantage_adversaire"?"text-red-400":cageBucket==="avantage_joueur"?"text-emerald-400":"text-zinc-500"}`}>{cagePositionLabel(cageBucket)}</div>
          {(opt.oppCuts||[]).length>0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {opt.oppCuts.map((oc,i)=>(<span key={i} className="text-[9px] bg-zinc-800 text-orange-300 px-2 py-0.5 rounded-full">{oc.icon} Adversaire : {oc.label}</span>))}
            </div>
          )}
          <div className="text-sm text-zinc-300 mb-4 italic">📣 "{flash}"</div>
          <div className="text-xs text-zinc-500 mb-2">Quel ordre donnes-tu pour le round {opt.roundIndex} ?</div>
          <div className="space-y-2">
            {orders.map(o=>(
              <button key={o.id} onClick={()=>pickCornerOrder(o.id)} className={`${BTN} w-full text-left bg-zinc-950 border border-zinc-800 hover:border-sky-600 rounded-xl px-3 py-2`}>
                <div className="font-semibold text-sm">{o.label}</div>
                <div className="text-xs text-zinc-500">{o.desc}</div>
              </button>
            ))}
          </div>
          <div className="text-xs text-zinc-500 mt-4 mb-2">Ou changer complètement de tactique pour la suite du combat :</div>
          <div className="flex flex-wrap gap-2">
            {TACTICS.filter(t=>t.id!==opt.tacticId).map(t=>(
              <button key={t.id} onClick={()=>pickCornerTacticSwitch(t.id)} className={`${BTN} bg-zinc-950 border border-zinc-800 hover:border-purple-600 rounded-full px-3 py-1.5 text-xs font-semibold`}>
                🔄 {t.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (phase === "fight-cutman" && pendingFight){
    const opt = pendingFight;
    const activeCut = (opt.fightInjuries||[]).find(fi=>fi.id==="fi_coupure" || fi.id==="fi_oeil");
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
        <style>{BOUNCE_STYLE}</style>
        <div className="max-w-md w-full bg-zinc-900 border border-red-800 rounded-xl p-6">
          <div className="text-xs uppercase tracking-widest text-red-500 font-bold mb-1">Inspection médicale entre les rounds</div>
          <div className="text-[11px] text-zinc-500 mb-3">Le médecin du combat examine ta blessure avant d'autoriser la suite.</div>
          {activeCut && (
            <div className="flex items-center gap-2 mb-4 bg-zinc-950 border border-zinc-800 rounded-lg p-3">
              <span className="text-xl">{activeCut.icon}</span>
              <div>
                <div className="text-sm font-semibold">{activeCut.label}</div>
                <div className="text-xs text-zinc-500">{activeCut.desc}</div>
              </div>
            </div>
          )}
          <div className="text-xs text-zinc-500 mb-2">Que fait ton coin ?</div>
          <div className="space-y-2">
            <button onClick={()=>pickCutmanChoice("vaseline")} className={`${BTN} w-full text-left bg-zinc-950 border border-zinc-800 hover:border-sky-600 rounded-xl px-3 py-2`}>
              <div className="font-semibold text-sm">🧴 Vaseline</div>
              <div className="text-xs text-zinc-500">Traitement classique et sûr : réduit modérément le risque d'arrêt médical ce round.</div>
            </button>
            <button onClick={()=>pickCutmanChoice("adrenaline")} disabled={!!opt.cutmanAdrenalineUsed}
              className={`${BTN} w-full text-left rounded-xl px-3 py-2 border ${opt.cutmanAdrenalineUsed ? "bg-zinc-950 border-zinc-900 opacity-40 cursor-not-allowed" : "bg-zinc-950 border-red-800 hover:border-red-500"}`}>
              <div className="font-semibold text-sm">💉 Adrénaline {opt.cutmanAdrenalineUsed && "(déjà utilisée ce combat)"}</div>
              <div className="text-xs text-zinc-500">Effet bien plus fort sur la coupure, mais si le médecin repère le traitement irrégulier, c'est l'arrêt immédiat. Une seule fois par combat.</div>
            </button>
            <button onClick={()=>pickCutmanChoice("rien")} className={`${BTN} w-full text-left bg-zinc-950 border border-zinc-800 hover:border-zinc-600 rounded-xl px-3 py-2`}>
              <div className="font-semibold text-sm">🩺 Laisser le médecin inspecter sans rien tenter</div>
              <div className="text-xs text-zinc-500">Aucun risque supplémentaire, mais aucun effet non plus.</div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "fight-action" && pendingActions.length && pendingFight){
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
        <style>{BOUNCE_STYLE}</style>
        <div className="max-w-md w-full bg-zinc-900 border border-emerald-700 rounded-xl p-6">
          <div className="text-xs uppercase tracking-widest text-emerald-500 font-bold mb-1">Pendant le combat · round {pendingFight.roundIndex}/{pendingFight.maxRoundPlanned}</div>
          <div className="text-[11px] text-zinc-500 mb-1">{name.split(" ")[0] || "Toi"} vs {pendingFight.opponent}</div>
          {pendingFight.referee && <div className="text-[10px] text-zinc-600 mb-2">🧑‍⚖️ {pendingFight.referee.name} · {refereeStyleLabel(pendingFight.referee)}</div>}
          <div className={`text-[10px] font-semibold uppercase tracking-widest mb-2 ${cagePositionBucket(pendingFight.cagePosScore||0)==="avantage_adversaire"?"text-red-400":cagePositionBucket(pendingFight.cagePosScore||0)==="avantage_joueur"?"text-emerald-400":"text-zinc-500"}`}>{cagePositionLabel(cagePositionBucket(pendingFight.cagePosScore||0))}</div>
          {pendingFight.intimidationRound1 && pendingFight.roundIndex===1 && (
            <div className="mb-2"><span className="text-[9px] bg-fuchsia-900/60 text-fuchsia-300 px-2 py-0.5 rounded-full uppercase">🧠 Adversaire intimidé par ton aura</span></div>
          )}
          {(pendingFight.oppAdapt && (pendingFight.oppAdapt.prudent || pendingFight.oppAdapt.switchedGround || pendingFight.oppAdapt.pressing)) && (
            <div className="flex flex-wrap gap-1 mb-2">
              {pendingFight.oppAdapt.prudent && <span className="text-[9px] bg-blue-900/60 text-blue-300 px-2 py-0.5 rounded-full uppercase">Adversaire devenu prudent</span>}
              {pendingFight.oppAdapt.switchedGround && <span className="text-[9px] bg-purple-900/60 text-purple-300 px-2 py-0.5 rounded-full uppercase">Il a basculé au sol</span>}
              {pendingFight.oppAdapt.pressing && <span className="text-[9px] bg-red-900/60 text-red-300 px-2 py-0.5 rounded-full uppercase">Il monte la pression</span>}
            </div>
          )}
          {(pendingFight.fightInjuries||[]).length>0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {pendingFight.fightInjuries.map((fi,i)=>(<span key={i} className="text-[9px] bg-zinc-800 text-red-300 px-2 py-0.5 rounded-full">{fi.icon} {fi.label}</span>))}
            </div>
          )}
          {(pendingFight.oppCuts||[]).length>0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {pendingFight.oppCuts.map((oc,i)=>(<span key={i} className="text-[9px] bg-zinc-800 text-orange-300 px-2 py-0.5 rounded-full">{oc.icon} Adversaire : {oc.label}</span>))}
            </div>
          )}
          <div className="text-sm text-zinc-500 mb-4">Choisis une seule action pour ce round : une technique apprise (ou un enchaînement standard), une action risquée, ou le jeu prudent.</div>
          <div className="space-y-2">
            {pendingActions.map((a,i)=>(
              <button key={i} onClick={()=>pickFightAction(a)}
                className={`${BTN} w-full text-left bg-zinc-950 border rounded-xl px-3 py-2 text-sm ${a.kind==="risky"?"border-red-800 hover:border-red-500":a.kind==="technique"?"border-zinc-800 hover:border-emerald-600":"border-zinc-800 hover:border-zinc-600"}`}>
                <div className="font-semibold flex justify-between items-center">
                  <span>{a.label}</span>
                  {a.successChance!=null && <span className="text-[10px] text-zinc-500 uppercase">{a.successChance}% de réussite</span>}
                </div>
                <div className="text-xs text-zinc-500">{a.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (phase === "fight-result" && pendingFightResult){
    const r = pendingFightResult;
    const isNeutral = r.win === null;
    const winColor = isNeutral ? "text-zinc-300" : r.win ? "text-emerald-400" : "text-red-500";
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
        <style>{BOUNCE_STYLE}</style>
        <div className="max-w-md w-full">
          <div className="text-center mb-4 level-up-pop">
            <div className={`text-xs tracking-widest font-bold mb-1 ${isNeutral?"text-zinc-400":r.win?"text-emerald-500":"text-red-500"}`}>
              {r.titleWon ? "COMBAT POUR LE TITRE" : r.isTitle ? "COMBAT POUR LE TITRE — ÉCHEC" : "RÉSULTAT DU COMBAT"}
            </div>
            <h2 className={`text-5xl font-black uppercase italic ${winColor}`}>{isNeutral ? (r.method.code==="no_contest" ? "No Contest" : "Match nul") : r.win ? "Victoire" : "Défaite"}</h2>
            <div className="text-zinc-400 text-sm mt-1">{methodLabel(r.method)}</div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-3">
            <div className="text-xs uppercase tracking-widest text-zinc-500 mb-1">{r.orgName}</div>
            <div className="font-bold text-lg mb-1">{(name.split(" ")[0] || "Toi")} vs {r.opponent}</div>
            {r.opponentTag && <div className="text-xs text-fuchsia-400 mb-1">🐐 {r.opponentTag}</div>}
            {r.city && <div className="text-[10px] text-zinc-500 mb-1">📍 {r.city} · {r.cardLabel}</div>}
            <div className="flex flex-wrap gap-1 mb-2">
              {r.titleWon && <span className="text-[10px] bg-yellow-500 text-black font-bold px-2 py-0.5 rounded-full uppercase">🏆 Nouveau titre remporté</span>}
              {r.netflix && <span className="text-[10px] bg-red-700 px-2 py-0.5 rounded-full uppercase font-bold">Événement Netflix</span>}
              {r.newUfcContract && <span className="text-[10px] bg-yellow-600 text-black px-2 py-0.5 rounded-full uppercase font-bold">Contrat UFC décroché</span>}
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs mt-2">
              <div><span className="text-zinc-500">Bourse </span><span className="font-bold">{eur(r.purse)}</span></div>
              <div><span className="text-zinc-500">Réputation </span><span className="font-bold">{Math.round(r.repBefore)} → {Math.round(r.repAfter)}</span></div>
              <div><span className="text-zinc-500">Santé </span><span className={`font-bold ${r.healthAfter<35?"text-red-500":""}`}>{Math.round(r.healthBefore)} → {Math.round(r.healthAfter)}</span></div>
              <div><span className="text-zinc-500">Moral </span><span className="font-bold">{Math.round(r.moralBefore)} → {Math.round(r.moralAfter)}</span></div>
              <div><span className="text-zinc-500">Aura </span><span className="font-bold text-fuchsia-400">{Math.round(r.auraBefore)} → {Math.round(r.auraAfter)}</span></div>
              <div><span className="text-zinc-500">Hype </span><span className="font-bold text-orange-400">{Math.round(r.hypeBefore)} → {Math.round(r.hypeAfter)}</span></div>
            </div>
            <div className="text-[10px] text-zinc-500 mt-3">✈️ Déplacement : billets {eur(r.travel.flight)} · hôtel {eur(r.travel.hotel)} · staff {eur(r.travel.coachTravel)} ({r.travel.climate}, {jetlagLabel(r.travel.tz).txt.toLowerCase()})</div>
            {r.recoveryWeeks > 1 && (
              <div className="text-xs text-red-400 mt-2">🩹 {r.recoveryTag} — {r.recoveryWeeks} semaine{r.recoveryWeeks>1?"s":""} de convalescence{r.medicalBan?" (interdiction médicale)":""}.</div>
            )}
          </div>

          {r.referee && (
            <div className="text-[11px] text-zinc-500 mb-3">🧑‍⚖️ Officié par {r.referee.name} ({refereeStyleLabel(r.referee)}).</div>
          )}

          {(r.fightInjuries||[]).length > 0 && (
            <div className="bg-zinc-900 border border-red-900/60 rounded-xl p-3 mb-4">
              <div className="text-xs uppercase tracking-widest text-red-400 font-bold mb-2">Blessures subies pendant le combat</div>
              <div className="flex flex-wrap gap-2">
                {r.fightInjuries.map((fi,i)=>(
                  <span key={i} className="text-[11px] bg-zinc-800 text-red-300 px-2 py-1 rounded-full">{fi.icon} {fi.label}</span>
                ))}
              </div>
            </div>
          )}

          {r.scorecards && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 mb-4">
              <div className="text-xs uppercase tracking-widest text-zinc-400 font-bold mb-2">Cartes des juges — décision {r.method.decisionType}</div>
              <div className="space-y-1">
                {r.scorecards.map((c,i)=>(
                  <div key={i} className="flex justify-between text-[12px]">
                    <span className="text-zinc-500">{c.judge}</span>
                    <span className="font-mono font-bold">{c.totals[0]}-{c.totals[1]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {r.levelUps.length > 0 && (
            <div className="space-y-2 mb-4">
              {r.levelUps.map(u=>(
                <div key={u.key} className={`level-up-pop ${u.dir==="up"?"level-up-glow border-yellow-500":"border-red-600"} bg-zinc-900 border rounded-xl p-3 flex items-center gap-3`}>
                  <span className="text-2xl">{u.dir==="up"?"⬆️":"⬇️"}</span>
                  <div>
                    <div className={`font-bold text-sm ${u.dir==="up"?"text-yellow-400":"text-red-400"}`}>{u.dir==="up"?"Niveau supérieur":"Niveau inférieur"} — {u.label}</div>
                    <div className="text-xs text-zinc-400">Niveau {u.from} → {u.to} · {u.levelName}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button onClick={continueAfterFightResult}
            className={`${BTN} w-full ${isNeutral?"bg-zinc-600 hover:bg-zinc-500":r.win?"bg-emerald-600 hover:bg-emerald-500":"bg-red-600 hover:bg-red-500"} text-white font-bold uppercase tracking-wide py-3 rounded-xl`}>
            Continuer
          </button>
        </div>
      </div>
    );
  }

  if (phase === "contract-offer" && pendingContract){
    const { org, fights, bonus, perFightMin, winBonus, titleBonus, renewal, titleClause, negotiationsLeft } = pendingContract;
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
        <style>{BOUNCE_STYLE}</style>
        <div className="max-w-md w-full bg-zinc-900 border border-yellow-600 rounded-xl p-6">
          <div className="text-xs uppercase tracking-widest text-yellow-500 font-bold mb-2">{renewal ? "Offre de renouvellement" : "Offre de contrat"}</div>
          <div className="text-lg font-semibold mb-1">{org.name} veut te lier par contrat.</div>
          <div className="text-sm text-zinc-300 mb-1">{fights} combats · prime à la signature {eur(bonus)}</div>
          <div className="text-xs text-zinc-400 space-y-0.5 mb-4">
            <div>Minimum garanti : {eur(perFightMin)} / combat</div>
            <div>Prime de victoire : {eur(winBonus)}</div>
            <div>Prime en cas de combat pour le titre remporté : {eur(titleBonus)}</div>
            {titleClause && <div className="text-emerald-400">🏆 Clause de titre garanti après 3 victoires sous contrat</div>}
          </div>
          <div className="text-xs text-zinc-500 mb-4">Sous contrat, tu combats exclusivement pour cette organisation jusqu'à son terme (rupture anticipée possible, à prix fort).</div>
          {negotiationsLeft > 0 && (
            <div className="mb-4">
              <div className="text-xs text-zinc-500 mb-2">Négocier ({negotiationsLeft} tentative{negotiationsLeft>1?"s":""} restante{negotiationsLeft>1?"s":""}) :</div>
              <div className="space-y-2">
                {CONTRACT_NEGOTIATION_OPTIONS.filter(o=>o.id!=="clause_titre" || !titleClause).map(o=>(
                  <button key={o.id} onClick={()=>negotiateContract(o.id)} className={`${BTN} w-full text-left bg-zinc-950 border border-zinc-800 hover:border-yellow-600 rounded-xl px-3 py-2`}>
                    <div className="font-semibold text-xs">{o.label}</div>
                    <div className="text-[10px] text-zinc-500">{o.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={acceptContract} className={`${BTN} flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-bold uppercase text-sm py-2 rounded-xl`}>Signer</button>
            <button onClick={declineContract} className={`${BTN} flex-1 bg-zinc-800 hover:bg-zinc-700 font-bold uppercase text-sm py-2 rounded-xl`}>Décliner</button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "coach-decision" && state){
    const coach = headCoachById(state.headCoachId);
    const isWin = pendingCoachContext === "win";
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
        <style>{BOUNCE_STYLE}</style>
        <div className={`max-w-md w-full bg-zinc-900 border rounded-xl p-6 ${isWin?"border-emerald-700":"border-red-700"}`}>
          <div className={`text-xs uppercase tracking-widest font-bold mb-2 ${isWin?"text-emerald-500":"text-red-500"}`}>
            {isWin ? "Après une grande victoire" : "Après une série de défaites"}
          </div>
          <div className="text-lg font-semibold mb-1">{coach.name}</div>
          <div className="text-xs text-zinc-500 mb-4">{coach.desc}</div>
          <div className="text-sm text-zinc-300 mb-5">
            {isWin
              ? "Cette victoire éclatante te fait réfléchir : rester fidèle à ton coach actuel, ou viser plus haut avec quelqu'un de plus ambitieux ?"
              : "Ton camp traverse une mauvaise passe. Continues-tu avec ton coach actuel, ou est-il temps de tourner la page ?"}
          </div>
          <div className="text-xs text-zinc-500 mb-4">Relation actuelle avec ton coach : <span className="font-bold text-zinc-300">{Math.round(state.coachRelation)}/100</span></div>
          <div className="flex gap-2">
            <button onClick={()=>resolveCoachDecision("keep")} className={`${BTN} flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase text-sm py-2 rounded-xl`}>Continuer avec lui</button>
            <button onClick={()=>resolveCoachDecision("fire")} className={`${BTN} flex-1 bg-red-700 hover:bg-red-600 text-white font-bold uppercase text-sm py-2 rounded-xl`}>Le licencier</button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "career" && state){

    const gym = currentGym(state);
    const canRetire = state.age >= 25;
    const discCount = state.discoveredTechniques.length;
    const wc = weightClassById(state.weightClassId);
    const currentCoachInfo = headCoachById(state.headCoachId);
    const fightingStyleEvo = computeFightingStyleEvolution(state);
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4">
        <style>{BOUNCE_STYLE}</style>

        {levelUpToast.length > 0 && (
          <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center px-4 w-full max-w-sm">
            {levelUpToast.map(u=>(
              <div key={u._id} className={`toast-anim ${u.dir==="up"?"level-up-glow border-yellow-500":"border-red-600"} bg-zinc-900 border rounded-xl px-4 py-2 text-xs shadow-xl flex items-center gap-2 w-full`}>
                <span className="text-lg">{u.dir==="up"?"⬆️":"⬇️"}</span>
                <div>
                  <div className={`font-bold ${u.dir==="up"?"text-yellow-400":"text-red-400"}`}>{u.dir==="up"?"Niveau supérieur":"Niveau inférieur"} — {u.label}</div>
                  <div className="text-zinc-400">{u.from} → {u.to} · {u.levelName}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="max-w-2xl mx-auto">
          <div className="flex flex-wrap justify-between items-center gap-1 mb-2 text-xs text-zinc-500">
            <div>{name} · <span className="text-zinc-400">{state.styleName}</span> · <span className="text-zinc-400">{wc.name}</span></div>
            <div>📅 Semaine {state.week||1}/52 · {state.year||2026}</div>
          </div>

          {/* Core stat bar */}

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 mb-3 grid grid-cols-4 sm:grid-cols-8 gap-2 text-center text-xs">
            <div><div className="text-zinc-500">ÂGE</div><div className="font-bold text-lg">{state.age}</div></div>
            <div><div className="text-zinc-500">BILAN</div><div className="font-bold text-lg">{state.wins}-{state.losses}</div></div>
            <div><div className="text-zinc-500">TITRES</div><div className="font-bold text-lg text-yellow-400">{state.titles}</div></div>
            <div><div className="text-zinc-500">SANTÉ</div><div className={`font-bold text-lg ${state.health<35?"text-red-500":"text-emerald-400"}`}>{Math.round(state.health)}</div></div>
            <div><div className="text-zinc-500">ÉNERGIE</div><div className={`font-bold text-lg ${state.energie<35?"text-red-500":"text-sky-400"}`}>{Math.round(state.energie)}</div></div>
            <div><div className="text-zinc-500">FATIGUE MENTALE</div><div className={`font-bold text-lg ${(state.mentalFatigue||0)>=65?"text-red-500":"text-indigo-400"}`}>{Math.round(state.mentalFatigue||0)}</div></div>
            <div><div className="text-zinc-500">MORAL</div><div className="font-bold text-lg">{Math.round(state.moral)}</div></div>
            <div><div className="text-zinc-500">RÉPUT.</div><div className="font-bold text-lg">{Math.round(state.reputation)}</div></div>
          </div>

          {/* Discipline stat bar */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 mb-3 grid grid-cols-3 gap-2 text-center text-xs">
            <div><div className="text-zinc-500">BOXE</div><div className="font-bold text-lg">{Math.round(state.boxe)}</div><div className="text-[10px] text-zinc-600">Niv.{disciplineLevel(state.boxe)} · {levelName(disciplineLevel(state.boxe))}</div></div>
            <div><div className="text-zinc-500">GRAPPLING</div><div className="font-bold text-lg">{Math.round(state.grappling)}</div><div className="text-[10px] text-zinc-600">Niv.{disciplineLevel(state.grappling)} · {levelName(disciplineLevel(state.grappling))}</div></div>
            <div><div className="text-zinc-500">LUTTE</div><div className="font-bold text-lg">{Math.round(state.lutte)}</div><div className="text-[10px] text-zinc-600">Niv.{disciplineLevel(state.lutte)} · {levelName(disciplineLevel(state.lutte))}</div></div>
          </div>

          {/* Extra attributes bar */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 mb-3 grid grid-cols-5 gap-2 text-center text-xs">
            <div><div className="text-zinc-500">CARDIO</div><div className="font-bold text-lg">{Math.round(state.cardio)}</div><div className="text-[10px] text-zinc-600">Niv.{disciplineLevel(state.cardio)}</div></div>
            <div><div className="text-zinc-500">MENTAL</div><div className="font-bold text-lg">{Math.round(state.mental)}</div><div className="text-[10px] text-zinc-600">Niv.{disciplineLevel(state.mental)}</div></div>
            <div><div className="text-zinc-500">MENTON</div><div className="font-bold text-lg">{Math.round(state.chin)}</div><div className="text-[10px] text-zinc-600">Niv.{disciplineLevel(state.chin)}</div></div>
            <div><div className="text-zinc-500">AURA</div><div className="font-bold text-lg text-fuchsia-400">{Math.round(state.aura)}</div></div>
            <div><div className="text-zinc-500">HYPE</div><div className="font-bold text-lg text-orange-400">{Math.round(state.hype||0)}</div></div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 mb-4 flex flex-wrap gap-x-4 gap-y-1 justify-between text-xs">
            <div><span className="text-zinc-500">GAINS : </span><span className="font-bold">{eur(state.money)}</span></div>
            {state.dette > 0 && <div><span className="text-zinc-500">DETTE : </span><span className="font-bold text-red-500">{eur(state.dette)}</span></div>}
            <div><span className="text-zinc-500">RELATION COACH : </span><span className="font-bold">{Math.round(state.coachRelation)}</span></div>
            {state.hasAgent && <div><span className="text-zinc-500">AGENT : </span><span className="font-bold">commission {Math.round(state.agentCut*100)}%</span></div>}
            {state.sponsorWeekly>0 && <div><span className="text-zinc-500">SPONSOR : </span><span className="font-bold text-emerald-400">+{eur(state.sponsorWeekly)}/sem. ({state.sponsorWeeksLeft} sem. restantes)</span></div>}
          </div>

          {state.contract && (
            <div className="bg-zinc-900 border border-yellow-700 rounded-xl p-3 mb-3 text-xs">
              <div className="flex justify-between items-center mb-1">
                <div>Sous contrat <span className="font-bold text-yellow-500">{state.contract.orgName}</span> — {state.contract.fightsRemaining} combat(s) restant(s)</div>
                <button onClick={breakContract} className={`${BTN} bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded-full uppercase tracking-wide`}>Rupture anticipée</button>
              </div>
              <div className="text-zinc-500">Garanti {eur(state.contract.perFightMin)}/combat · prime victoire {eur(state.contract.winBonus)} · prime titre {eur(state.contract.titleBonus)}</div>
            </div>
          )}

          {/* États persistants issus des happenings rares : buffs/debuffs durables sur la carrière */}
          {(state.persistentStates||[]).length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 mb-3">
              <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">États actifs</div>
              <div className="flex flex-wrap gap-2">
                {state.persistentStates.map(p=>(
                  <div key={p.id} title={p.label} className={`text-[11px] rounded-full px-2 py-1 border flex items-center gap-1 ${p.type==="debuff" ? "border-red-800 text-red-400" : "border-emerald-700 text-emerald-400"}`}>
                    <span>{p.icon||"•"}</span>
                    <span className="font-semibold">{p.label}</span>
                    {p.weeksLeft != null && <span className="text-zinc-500">· {p.weeksLeft} sem.</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Blessures localisées, style évolutif, rivaux et classement */}
          {((state.localizedInjuries||[]).length>0 || fightingStyleEvo || (state.rivals||[]).length>0 || Object.keys(state.orgRanks||{}).length>0 || Object.keys(state.countryPopularity||{}).length>0 || state.globalRank) && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 mb-3 text-xs space-y-2">
              {(state.relationshipStatus && state.relationshipStatus!=="célibataire") || (state.children||0)>0 ? (
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-pink-500 font-bold mb-1">Vie personnelle</div>
                  <div className="text-zinc-300">💞 {state.relationshipStatus}{(state.children||0)>0 ? ` · 👶 ${state.children} enfant${state.children>1?"s":""}` : ""}</div>
                </div>
              ) : null}
              {Object.keys(state.countryPopularity||{}).length>0 && (
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-fuchsia-500 font-bold mb-1">Popularité par pays/région</div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(state.countryPopularity||{}).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([region,pop])=>(
                      <div key={region} className="rounded-full px-2 py-1 border border-fuchsia-800 text-fuchsia-300">
                        {region} : <span className="font-bold">{popularityLabel(pop)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {(state.localizedInjuries||[]).length>0 && (
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-red-500 font-bold mb-1">Blessures localisées</div>
                  <div className="flex flex-wrap gap-2">
                    {state.localizedInjuries.map(li=>(
                      <div key={li.id} className="rounded-full px-2 py-1 border border-red-800 text-red-400 flex items-center gap-1">
                        <span>{li.icon}</span><span className="font-semibold">{li.label}</span><span className="text-zinc-500">· {li.weeksLeft} sem.</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {fightingStyleEvo && (
                <div><span className="text-zinc-500 uppercase tracking-widest text-[10px]">Style : </span><span className="font-bold text-sky-400">{fightingStyleEvo.label}</span> <span className="text-zinc-500">— {fightingStyleEvo.desc}</span></div>
              )}
              {(state.rivals||[]).length>0 && (
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-red-500 font-bold mb-1">Rivalités</div>
                  <div className="flex flex-wrap gap-2">
                    {state.rivals.map((r,i)=>(
                      <div key={i} className="rounded-full px-2 py-1 border border-orange-700 text-orange-400">
                        🔥 {r.name} ({r.myWins}-{r.myLosses}) · {r.orgName}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {Object.keys(state.orgRanks||{}).length>0 && (
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-sky-500 font-bold mb-1">Classements</div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(state.orgRanks||{}).map(([orgId,rank])=>{
                      const org = ORGS.find(o=>o.id===orgId);
                      if (!org) return null;
                      return <div key={orgId} className="rounded-full px-2 py-1 border border-zinc-700 text-zinc-300">{org.name} : <span className="font-bold text-yellow-400">{rank===0?"🏆 Champion":`#${rank}`}</span></div>;
                    })}
                  </div>
                </div>
              )}
              {state.globalRank && (
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-amber-500 font-bold mb-1">Classement mondial (Top 50 P4P)</div>
                  <div className="rounded-full px-2 py-1 border border-amber-700 text-amber-300 inline-block font-bold">
                    {globalRankLabel(state.globalRank)}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mb-3">
            <div className="text-xs text-zinc-500 mb-2">Camp actuel : <span className="text-zinc-300 font-semibold">{gym.name}</span> · Coach : <span className="text-zinc-300 font-semibold">{currentCoachInfo.name}</span></div>

            {/* ---- Actions critiques toujours visibles, peu importe l'onglet sélectionné ---- */}
            {(state.dette > 0 || canRetire) && (
              <div className="flex flex-wrap gap-2 mb-2">
                {state.dette > 0 && <button onClick={payDebt} className={`${BTN} text-xs bg-red-800 hover:bg-red-700 px-3 py-1.5 rounded-xl uppercase tracking-wide`}>💸 Rembourser la dette</button>}
                {canRetire && <button onClick={retireNow} className={`${BTN} text-xs bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-xl uppercase tracking-wide`}>🎖️ Prendre sa retraite</button>}
              </div>
            )}

            {/* ---- Onglets du menu principal ---- */}
            <div className="flex flex-wrap gap-1 border-b border-zinc-800 mb-2">
              {MENU_TABS.map(tab=>(
                <button key={tab.id} onClick={()=>setMenuTab(tab.id)}
                  className={`text-xs px-3 py-1.5 uppercase tracking-wide font-bold border-b-2 -mb-px transition ${menuTab===tab.id ? tab.activeClass : "text-zinc-600 border-transparent hover:text-zinc-300"}`}>
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* ---- Actions de l'onglet sélectionné ---- */}
            <div className="flex flex-wrap gap-2">
              {menuTab==="combats" && (<>
                {!state.contract && <button onClick={()=>openPanel("negotiate")} className={`${BTN} text-xs bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-xl uppercase tracking-wide`}>Chercher un contrat</button>}
                <button onClick={()=>openPanel("worldmap")} className={`${BTN} text-xs bg-sky-900 hover:bg-sky-800 px-3 py-1.5 rounded-xl uppercase tracking-wide`}>🥊 Combats proposés</button>
                <button onClick={()=>openPanel("weightclass")} className={`${BTN} text-xs bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-xl uppercase tracking-wide`}>Catégorie ({wc.name})</button>
              </>)}
              {menuTab==="entrainement" && (<>
                <button onClick={()=>openPanel("gym")} className={`${BTN} text-xs bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-xl uppercase tracking-wide`}>Changer de camp</button>
                <button onClick={()=>openPanel("camps")} className={`${BTN} text-xs bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-xl uppercase tracking-wide`}>Stage à l'étranger</button>
                <button onClick={()=>openPanel("techniques")} className={`${BTN} text-xs bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-xl uppercase tracking-wide`}>Techniques ({discCount}/{TECHNIQUES.length}) · {state.techPoints||0} pt{(state.techPoints||0)>1?"s":""}</button>
              </>)}
              {menuTab==="equipe" && (<>
                <button onClick={()=>openPanel("coach")} className={`${BTN} text-xs bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-xl uppercase tracking-wide`}>Coach principal</button>
                <button onClick={()=>openPanel("staff")} className={`${BTN} text-xs bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-xl uppercase tracking-wide`}>Staff ({(state.hiredStaff||[]).length}/{(state.discoveredStaff||[]).length})</button>
              </>)}
              {menuTab==="communication" && (<>
                <button onClick={()=>openPanel("social")} className={`${BTN} text-xs bg-fuchsia-900 hover:bg-fuchsia-800 px-3 py-1.5 rounded-xl uppercase tracking-wide`}>📱 Réseaux ({followersLabel(state.followers||0)})</button>
              </>)}
              {menuTab==="finances" && (<>
                <button onClick={()=>openPanel("investments")} className={`${BTN} text-xs bg-lime-900 hover:bg-lime-800 px-3 py-1.5 rounded-xl uppercase tracking-wide`}>💰 Patrimoine ({(state.investments||[]).length}/{INVESTMENTS.length})</button>
              </>)}
              {menuTab==="objectifs" && (<>
                <button onClick={()=>openPanel("objectives")} className={`${BTN} text-xs bg-yellow-900 hover:bg-yellow-800 px-3 py-1.5 rounded-xl uppercase tracking-wide`}>🎯 Objectifs ({(state.objectivesCompleted||[]).length}/{OBJECTIVES.length}) · Records ({(state.recordsBroken||[]).length}/{RECORDS.length})</button>
              </>)}
            </div>
          </div>

          {activePanel === "negotiate" && (
            <div className="bg-zinc-900 border border-yellow-800 rounded-xl p-4 mb-4">
              <div className="text-xs uppercase tracking-widest text-yellow-500 mb-2">Démarcher une organisation</div>
              <div className="grid gap-2 max-h-72 overflow-y-auto">
                {availableOrgs(state.reputation, state.age).map(org=>{
                  const lbl = interestLabel(contractChance(org, state));
                  return (
                    <button key={org.id} onClick={()=>requestContract(org)}
                      className={`${BTN} text-left border border-zinc-800 hover:border-yellow-600 bg-zinc-950 rounded-xl px-3 py-2`}>
                      <div className="flex justify-between text-sm font-semibold">
                        <span>{org.name}</span>
                        <span className={lbl.color}>{lbl.txt}</span>
                      </div>
                      <div className="text-xs text-zinc-500">{org.region}</div>
                    </button>
                  );
                })}
              </div>
              <button onClick={()=>closePanel()} className={`${BTN} mt-3 text-xs text-zinc-500 hover:text-zinc-300`}>Fermer</button>
            </div>
          )}

          {activePanel === "gym" && (
            <div className="bg-zinc-900 border border-red-800 rounded-xl p-4 mb-4">
              <div className="text-xs uppercase tracking-widest text-red-500 mb-2">Choisir un camp d'entraînement</div>
              <div className="grid gap-2">
                {GYMS.map(g=>(
                  <button key={g.id} onClick={()=>changeGym(g)} disabled={state.money<g.cost}
                    className={`${BTN} text-left border rounded-xl px-3 py-2 ${state.gymId===g.id?"border-red-600 bg-zinc-800":"border-zinc-800 bg-zinc-950"} ${state.money<g.cost?"opacity-40 cursor-not-allowed":"hover:border-red-600"}`}>
                    <div className="flex justify-between text-sm font-semibold">
                      <span>{g.name}</span>
                      <span className="text-zinc-400">{eur(g.cost)}</span>
                    </div>
                    <div className="text-xs text-zinc-500">{g.desc}</div>
                  </button>
                ))}
              </div>
              <button onClick={()=>closePanel()} className={`${BTN} mt-3 text-xs text-zinc-500 hover:text-zinc-300`}>Fermer</button>
            </div>
          )}

          {activePanel === "investments" && (
            <div className="bg-zinc-900 border border-lime-800 rounded-xl p-4 mb-4">
              <div className="text-xs uppercase tracking-widest text-lime-500 mb-2">Patrimoine — investissements durables</div>
              <div className="text-xs text-zinc-500 mb-2">Contrairement à un changement de camp, ces actifs sont acquis pour toujours et transforment structurellement tes finances ou ta récupération.</div>
              <div className="grid gap-2">
                {INVESTMENTS.map(inv=>{
                  const owned = hasInvestment(state, inv.id);
                  return (
                    <button key={inv.id} onClick={()=>buyInvestment(inv.id)} disabled={owned || state.money<inv.cost}
                      className={`${BTN} text-left border rounded-xl px-3 py-2 ${owned?"border-lime-600 bg-zinc-800":"border-zinc-800 bg-zinc-950"} ${(!owned && state.money<inv.cost)?"opacity-40 cursor-not-allowed":!owned?"hover:border-lime-600":""}`}>
                      <div className="flex justify-between text-sm font-semibold">
                        <span>{inv.label} {owned && "✅"}</span>
                        <span className="text-zinc-400">{owned ? "Acquis" : eur(inv.cost)}</span>
                      </div>
                      <div className="text-xs text-zinc-500">{inv.desc}</div>
                    </button>
                  );
                })}
              </div>
              {(state.totalPassiveIncome||0) > 0 && (
                <div className="text-xs text-lime-400 mt-2">Revenus passifs cumulés générés : {eur(state.totalPassiveIncome)}.</div>
              )}
              <button onClick={()=>closePanel()} className={`${BTN} mt-3 text-xs text-zinc-500 hover:text-zinc-300`}>Fermer</button>
            </div>
          )}

          {activePanel === "camps" && (
            <div className="bg-zinc-900 border border-sky-800 rounded-xl p-4 mb-4">
              <div className="text-xs uppercase tracking-widest text-sky-500 mb-2">Partir en stage à l'étranger</div>
              <div className="text-xs text-zinc-500 mb-2">Un stage consomme un cycle et booste une discipline précise bien plus qu'un entraînement classique — et te fait parfois rencontrer un spécialiste embauchable.</div>
              <div className="grid gap-2 max-h-80 overflow-y-auto">
                {TRAINING_CAMPS.map(camp=>(
                  <button key={camp.id} onClick={()=>goToCamp(camp)} disabled={state.money<camp.cost}
                    className={`${BTN} text-left border rounded-xl px-3 py-2 border-zinc-800 bg-zinc-950 ${state.money<camp.cost?"opacity-40 cursor-not-allowed":"hover:border-sky-600"}`}>
                    <div className="flex justify-between text-sm font-semibold">
                      <span>{camp.name}</span>
                      <span className="text-zinc-400">{eur(camp.cost)}</span>
                    </div>
                    <div className="text-xs text-zinc-500">{camp.desc}</div>
                  </button>
                ))}
              </div>
              <button onClick={()=>closePanel()} className={`${BTN} mt-3 text-xs text-zinc-500 hover:text-zinc-300`}>Fermer</button>
            </div>
          )}

          {activePanel === "staff" && (
            <div className="bg-zinc-900 border border-orange-800 rounded-xl p-4 mb-4">
              <div className="text-xs uppercase tracking-widest text-orange-500 mb-2">Staff spécialisé</div>
              {(state.discoveredStaff||[]).length === 0 && (
                <div className="text-xs text-zinc-500 mb-2">Aucun spécialiste rencontré pour l'instant — les stages à l'étranger et certains événements de carrière t'en feront découvrir.</div>
              )}
              <div className="text-xs text-zinc-500 mb-2">Coût mensuel total actuel : <span className="font-bold text-orange-400">{eur(staffMonthlyCost(state.hiredStaff))}</span></div>
              <div className="grid gap-2 max-h-80 overflow-y-auto">
                {(state.discoveredStaff||[]).map(id=>{
                  const spec = STAFF_SPECIALISTS.find(s=>s.id===id);
                  if (!spec) return null;
                  const hired = (state.hiredStaff||[]).includes(id);
                  return (
                    <div key={id} className={`border rounded-xl px-3 py-2 ${hired?"border-orange-600 bg-zinc-800":"border-zinc-800 bg-zinc-950"}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm font-semibold">{spec.name}</div>
                          <div className="text-xs text-zinc-500">{spec.role} · {spec.desc}</div>
                        </div>
                        <button onClick={()=> hired ? fireStaff(id) : hireStaff(id)}
                          className={`${BTN} text-xs px-2 py-1 rounded-full uppercase tracking-wide shrink-0 ml-2 ${hired?"bg-zinc-700 hover:bg-zinc-600":"bg-orange-600 hover:bg-orange-500"}`}>
                          {hired ? "Renvoyer" : `Embaucher (${eur(spec.cost)}/mois)`}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button onClick={()=>closePanel()} className={`${BTN} mt-3 text-xs text-zinc-500 hover:text-zinc-300`}>Fermer</button>
            </div>
          )}

          {activePanel === "coach" && (
            <div className="bg-zinc-900 border border-teal-800 rounded-xl p-4 mb-4">
              <div className="text-xs uppercase tracking-widest text-teal-500 mb-2">Coach principal</div>
              <div className="text-xs text-zinc-500 mb-2">Relation actuelle : <span className="font-bold text-teal-400">{Math.round(state.coachRelation)}/100</span>. Après une série de défaites ou une grande victoire, tu pourras choisir de le garder ou de le licencier.</div>
              <div className="grid gap-2 max-h-80 overflow-y-auto">
                {HEAD_COACHES.map(c=>{
                  const active = state.headCoachId === c.id;
                  return (
                    <div key={c.id} className={`border rounded-xl px-3 py-2 ${active?"border-teal-600 bg-zinc-800":"border-zinc-800 bg-zinc-950"}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm font-semibold">{c.name} {active && <span className="text-[10px] text-teal-400 uppercase ml-1">Actuel</span>}</div>
                          <div className="text-xs text-zinc-500">{c.desc}</div>
                          <div className="text-[10px] text-zinc-600 mt-0.5">Multiplicateur de progression x{c.skillMult.toFixed(2)} · {eur(c.cost)}/mois</div>
                        </div>
                        {!active && (
                          <button onClick={()=>hireHeadCoach(c.id)} disabled={state.money<c.cost*2}
                            className={`${BTN} text-xs px-2 py-1 rounded-full uppercase tracking-wide shrink-0 ml-2 ${state.money<c.cost*2?"opacity-40 cursor-not-allowed bg-zinc-700":"bg-teal-600 hover:bg-teal-500"}`}>
                            Recruter
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {state.headCoachId !== "coach_debutant" && (
                <button onClick={fireHeadCoach} className={`${BTN} mt-3 text-xs bg-red-800 hover:bg-red-700 px-3 py-1.5 rounded-xl uppercase tracking-wide`}>Licencier le coach actuel</button>
              )}
              <button onClick={()=>closePanel()} className={`${BTN} mt-3 ml-2 text-xs text-zinc-500 hover:text-zinc-300`}>Fermer</button>
            </div>
          )}

          {activePanel === "weightclass" && (
            <div className="bg-zinc-900 border border-indigo-800 rounded-xl p-4 mb-4">
              <div className="text-xs uppercase tracking-widest text-indigo-500 mb-2">Catégorie de poids actuelle : {wc.name}</div>
              <div className="text-xs text-zinc-500 mb-3">Changer de catégorie coûte un peu de temps et comporte un risque (coupe de poids ou adaptation au nouveau gabarit), mais peut aussi t'apporter un net avantage.</div>
              <div className="flex gap-2">
                {adjacentWeightClasses(state.weightClassId).down ? (
                  <button onClick={()=>changeWeightClass("down")} className={`${BTN} flex-1 bg-zinc-950 border border-zinc-800 hover:border-indigo-600 rounded-xl px-3 py-2 text-sm`}>
                    ⬇️ Descendre en {adjacentWeightClasses(state.weightClassId).down.name}
                  </button>
                ) : <div className="flex-1 text-xs text-zinc-600 flex items-center justify-center">Déjà la catégorie la plus basse</div>}
                {adjacentWeightClasses(state.weightClassId).up ? (
                  <button onClick={()=>changeWeightClass("up")} className={`${BTN} flex-1 bg-zinc-950 border border-zinc-800 hover:border-indigo-600 rounded-xl px-3 py-2 text-sm`}>
                    ⬆️ Monter en {adjacentWeightClasses(state.weightClassId).up.name}
                  </button>
                ) : <div className="flex-1 text-xs text-zinc-600 flex items-center justify-center">Déjà la catégorie la plus haute</div>}
              </div>
              <button onClick={()=>closePanel()} className={`${BTN} mt-3 text-xs text-zinc-500 hover:text-zinc-300`}>Fermer</button>
            </div>
          )}

          {activePanel === "worldmap" && (
            <div className="bg-zinc-900 border border-sky-800 rounded-xl p-4 mb-4">
              <div className="text-xs uppercase tracking-widest text-sky-500 mb-1">🥊 Combats proposés</div>
              <div className="text-xs text-zinc-500 mb-3">Choisis une destination pour voir le détail des frais et lancer le combat.</div>
              {options.filter(o=>o.type==="fight").length === 0 ? (
                <div className="text-xs text-zinc-600 py-2">Aucun combat proposé pour l'instant — repose-toi une semaine et reviens voir.</div>
              ) : (
                <div className="space-y-2 max-h-[28rem] overflow-y-auto">
                  {options.filter(o=>o.type==="fight").map((o,i)=>{
                    const lbl = winLabel(o.winChance);
                    return (
                      <button key={o.key||i} onClick={()=>{ closePanel(); pickFight(o); }}
                        className={`${BTN} w-full text-left bg-zinc-950 border rounded-xl p-3 ${o.lastMinute?"border-orange-600 hover:border-orange-400":o.dwcs?"border-yellow-600 hover:border-yellow-400":o.legendary?"border-fuchsia-700 hover:border-fuchsia-500":o.isTitle?"border-yellow-700 hover:border-yellow-500":"border-zinc-800 hover:border-sky-500"}`}>
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <div>
                            <div className="text-xs uppercase tracking-widest text-sky-400">📍 {o.city} · {o.org.name}</div>
                            <div className="font-bold text-sm">{name.split(" ")[0] || "Toi"} vs {o.opponent}</div>
                            {o.opponentTag && <div className="text-[11px] text-fuchsia-400">🐐 {o.opponentTag}</div>}
                          </div>
                          <div className="flex flex-col gap-1 items-end shrink-0">
                            {o.lastMinute && <span className="text-[9px] bg-orange-500 text-black font-bold px-2 py-0.5 rounded-full uppercase">⏱️ Dernière minute</span>}
                            {o.titleDefense && <span className="text-[9px] bg-yellow-400 text-black font-bold px-2 py-0.5 rounded-full uppercase">🛡️ Défense de titre</span>}
                            {o.isTitle && !o.titleDefense && <span className="text-[9px] bg-yellow-500 text-black font-bold px-2 py-0.5 rounded-full uppercase">Titre</span>}
                            {o.isRival && <span className="text-[9px] bg-red-600 text-white font-bold px-2 py-0.5 rounded-full uppercase">🔥 Rival{o.rivalMeetings>=2?" · Trilogie":""}</span>}
                            {o.dwcs && <span className="text-[9px] bg-yellow-600 text-black font-bold px-2 py-0.5 rounded-full uppercase">Contrat UFC</span>}
                            {o.netflix && <span className="text-[9px] bg-red-700 px-2 py-0.5 rounded-full uppercase font-bold">Netflix</span>}
                          </div>
                        </div>
                        {o.lastMinute && <div className="text-[10px] text-orange-400 mb-1">⏱️ Adversaire prévu blessé à quelques jours de l'événement — remplaçant proposé, moins de préparation mais bourse et réputation bonifiées si tu sauves la carte.</div>}
                        {o.orgObjective && !o.lastMinute && <div className="text-[10px] text-purple-400 mb-1">📋 {o.orgObjective.label}</div>}
                        <div className="text-[11px] text-zinc-500 mb-1">🥊 {styleLabel(o.oppStyleId)}{o.cardLabel?<> · <span className={cardPositionColor(o.cardKey)}>{o.cardLabel}</span></>:null} · {jetlagLabel(o.travel.tz).txt.toLowerCase()}</div>
                        <div className="flex justify-between items-center text-xs">
                          <span className={`font-semibold ${lbl.color}`}>{lbl.txt}</span>
                          <span className="text-zinc-400">{eur(o.purseLow)}–{eur(o.purseHigh)}{o.netflix?" (x2,6)":""} · <span className="text-red-400">-{eur(o.travel.total)} frais</span></span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              <button onClick={()=>closePanel()} className={`${BTN} mt-3 text-xs text-zinc-500 hover:text-zinc-300`}>Fermer</button>
            </div>
          )}

          {activePanel === "social" && (
            <div className="bg-zinc-900 border border-fuchsia-800 rounded-xl p-4 mb-4">
              <div className="text-xs uppercase tracking-widest text-fuchsia-500 mb-1">Réseaux sociaux</div>
              <div className="text-xs text-zinc-500 mb-3">
                👥 {followersLabel(state.followers||0)} abonnés cumulés · Polémique en cours : <span className={`font-bold ${(state.socialControversy||0)>=70?"text-red-400":(state.socialControversy||0)>=35?"text-yellow-400":"text-emerald-400"}`}>{Math.round(state.socialControversy||0)}/100</span>
                <br/>Publications restantes cette semaine : <span className="font-bold">{2-(state.socialPostsThisWeek||0)}/2</span>
              </div>
              {state.pendingBadBoyOffer && (
                <div className="bg-zinc-950 border border-red-800 rounded-xl p-3 mb-3">
                  <div className="text-sm font-semibold">{state.pendingBadBoyOffer.icon} {state.pendingBadBoyOffer.label}</div>
                  <div className="text-xs text-zinc-500 mb-2">Offre : +{eur(state.pendingBadBoyOffer.offeredWeekly)}/semaine pendant 20 semaines — mais clause de scandale : la controverse augmente chaque semaine tant que le contrat court.</div>
                  <div className="flex gap-2">
                    <button onClick={acceptBadBoyOffer} className={`${BTN} text-xs bg-red-900 hover:bg-red-800 px-3 py-1.5 rounded-lg uppercase tracking-wide`}>Signer</button>
                    <button onClick={declineBadBoyOffer} className={`${BTN} text-xs bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg uppercase tracking-wide`}>Décliner</button>
                  </div>
                </div>
              )}
              {(state.socialPostsThisWeek||0) >= 2 ? (
                <div className="text-xs text-zinc-600 py-2">Tu as déjà assez publié cette semaine — reviens la semaine prochaine.</div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {SOCIAL_PLATFORMS.map(platform=>(
                    <div key={platform.id}>
                      <div className="text-[11px] uppercase tracking-widest text-zinc-500 mb-1">{platform.icon} {platform.name}</div>
                      <div className="grid gap-1.5">
                        {SOCIAL_POSTS.map(post=>{
                          const lockedForMoney = post.moneyGain && (state.followers||0) < SOCIAL_MONEY_MIN_FOLLOWERS;
                          return (
                          <button key={platform.id+post.id} onClick={()=>postSocial(post, platform)}
                            className={`${BTN} w-full text-left bg-zinc-950 border border-zinc-800 hover:border-fuchsia-600 rounded-xl px-3 py-2`}>
                            <div className="font-semibold text-sm">{post.label}</div>
                            <div className="text-xs text-zinc-500">{post.desc}</div>
                            {lockedForMoney && <div className="text-[10px] text-yellow-600 mt-0.5">🔒 Rémunéré à partir de {followersLabel(SOCIAL_MONEY_MIN_FOLLOWERS)} abonnés (actuellement {followersLabel(state.followers||0)}).</div>}
                          </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={()=>closePanel()} className={`${BTN} mt-3 text-xs text-zinc-500 hover:text-zinc-300`}>Fermer</button>
            </div>
          )}

          {activePanel === "techniques" && (
            <div className="bg-zinc-900 border border-emerald-800 rounded-xl p-4 mb-4">
              <div className="text-xs uppercase tracking-widest text-emerald-500 mb-1">Techniques maîtrisées ({discCount}/{TECHNIQUES.length})</div>
              <div className="text-xs text-zinc-500 mb-2">Points de technique disponibles : <span className="font-bold text-emerald-400">{state.techPoints||0}</span>. Gagnés sur les victoires (davantage pour les titres) et parfois à l'entraînement. Au-delà du niveau requis, les techniques avancées (tier 3+) exigent un coach spécialisé adapté dans ton staff, et les plus avancées (tier 4-5) un stage à l'étranger dans la même discipline.</div>
              <div className="grid gap-1 max-h-80 overflow-y-auto text-xs">
                {["boxe","grappling","lutte","general"].map(disc=>(
                  <div key={disc} className="mb-2">
                    <div className="text-zinc-500 uppercase tracking-widest text-[10px] mb-1">{disc==="boxe"?"Frappe":disc==="grappling"?"Grappling":disc==="lutte"?"Lutte":"Général"}</div>
                    {TECHNIQUES.filter(t=>t.discipline===disc).map(t=>{
                      const known = state.discoveredTechniques.includes(t.id);
                      const skillOk = techniqueSkillMet(t, state);
                      const eligible = techniqueRequirementMet(t, state);
                      const lockReason = !known ? techniqueLockReason(t, state) : null;
                      const cost = techniqueCost(t);
                      const canBuy = eligible && (state.techPoints||0) >= cost;
                      return (
                        <div key={t.id} className={`px-2 py-1 rounded-xl mb-1 flex justify-between items-center gap-2 ${known?"bg-zinc-950 border border-emerald-800":eligible?"bg-zinc-950 border border-yellow-800":skillOk?"bg-zinc-950/70 border border-orange-900 text-zinc-400":"bg-zinc-950/50 border border-zinc-800 text-zinc-600"}`}>
                          <div>
                            <div className="font-semibold">{known || skillOk ? t.name : "??? (verrouillée)"}</div>
                            {(known || skillOk) && <div className="text-zinc-500">{t.desc}</div>}
                            {lockReason && <div className="text-orange-500 text-[10px] mt-0.5">🔒 {lockReason}</div>}
                          </div>
                          {!known && eligible && (
                            <button onClick={()=>learnTechnique(t)} disabled={!canBuy}
                              className={`${BTN} text-[10px] px-2 py-1 rounded-full uppercase tracking-wide shrink-0 ${canBuy?"bg-emerald-600 hover:bg-emerald-500":"opacity-40 cursor-not-allowed bg-zinc-700"}`}>
                              Apprendre ({cost} pt{cost>1?"s":""})
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-zinc-800">
                <div className="text-xs uppercase tracking-widest text-amber-500 mb-1">Arbre passif</div>
                <div className="text-[10px] text-zinc-500 mb-2">Perks permanents, achetés une fois avec les mêmes points de technique.</div>
                <div className="grid gap-1">
                  {PASSIVE_PERKS.map(perk=>{
                    const owned = (state.passivePerks||[]).includes(perk.id);
                    const canBuy = !owned && (state.techPoints||0) >= perk.cost;
                    return (
                      <div key={perk.id} className={`px-2 py-1 rounded-xl mb-1 flex justify-between items-center gap-2 ${owned?"bg-zinc-950 border border-amber-700":"bg-zinc-950 border border-zinc-800"}`}>
                        <div>
                          <div className="font-semibold text-xs">{perk.label}</div>
                          <div className="text-zinc-500 text-[10px]">{perk.desc}</div>
                        </div>
                        {!owned && (
                          <button onClick={()=>buyPassivePerk(perk.id)} disabled={!canBuy}
                            className={`${BTN} text-[10px] px-2 py-1 rounded-full uppercase tracking-wide shrink-0 ${canBuy?"bg-amber-600 hover:bg-amber-500":"opacity-40 cursor-not-allowed bg-zinc-700"}`}>
                            Débloquer ({perk.cost} pts)
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {activeSynergies(state).length > 0 && (
                <div className="mt-3 pt-3 border-t border-zinc-800">
                  <div className="text-xs uppercase tracking-widest text-sky-500 mb-1">Synergies de style actives</div>
                  <div className="grid gap-1">
                    {activeSynergies(state).map(syn=>(
                      <div key={syn.id} className="px-2 py-1 rounded-xl bg-zinc-950 border border-sky-700">
                        <div className="font-semibold text-xs">{syn.label}</div>
                        <div className="text-zinc-500 text-[10px]">{syn.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={()=>closePanel()} className={`${BTN} mt-2 text-xs text-zinc-500 hover:text-zinc-300`}>Fermer</button>
            </div>
          )}

          {activePanel === "objectives" && (
            <div className="bg-zinc-900 border border-yellow-800 rounded-xl p-4 mb-4">
              <div className="text-xs uppercase tracking-widest text-yellow-500 mb-1">Grands objectifs de carrière ({(state.objectivesCompleted||[]).length}/{OBJECTIVES.length})</div>
              <div className="text-xs text-zinc-500 mb-2">Les jalons les plus rares et les plus prestigieux d'une carrière : au-delà des ceintures, ce qui définit une légende.</div>
              <div className="grid gap-1 mb-4">
                {OBJECTIVES.map(o=>{
                  const done = (state.objectivesCompleted||[]).includes(o.id);
                  return (
                    <div key={o.id} className={`px-2 py-1.5 rounded-xl flex justify-between items-center gap-2 ${done?"bg-zinc-950 border border-yellow-600":"bg-zinc-950/70 border border-zinc-800"}`}>
                      <div>
                        <div className={`font-semibold text-xs ${done?"text-yellow-400":"text-zinc-300"}`}>{o.icon} {o.label} {done && "✅"}</div>
                        <div className="text-zinc-500 text-[10px]">{o.desc}</div>
                        {!done && <div className="text-zinc-600 text-[10px] mt-0.5">{o.progress(state)}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-xs uppercase tracking-widest text-sky-500 mb-1">Records du circuit à battre ({(state.recordsBroken||[]).length}/{RECORDS.length})</div>
              <div className="text-xs text-zinc-500 mb-2">Des repères historiques, distincts des ceintures : chaque record ne se bat qu'une seule fois.</div>
              <div className="grid gap-1">
                {RECORDS.map(r=>{
                  const done = (state.recordsBroken||[]).includes(r.id);
                  const cur = r.value(state);
                  const curDisplay = r.isMoney ? eur(cur) : `${cur} ${r.unit}`;
                  const targetDisplay = r.isMoney ? eur(r.target) : `${r.target} ${r.unit}`;
                  return (
                    <div key={r.id} className={`px-2 py-1.5 rounded-xl flex justify-between items-center gap-2 ${done?"bg-zinc-950 border border-sky-600":"bg-zinc-950/70 border border-zinc-800"}`}>
                      <div>
                        <div className={`font-semibold text-xs ${done?"text-sky-400":"text-zinc-300"}`}>{r.icon} {r.label} {done && "🏅"}</div>
                        <div className="text-zinc-600 text-[10px] mt-0.5">{done ? `Record battu : ${curDisplay}` : `Actuel : ${curDisplay} — objectif : ${targetDisplay}`}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button onClick={()=>closePanel()} className={`${BTN} mt-3 text-xs text-zinc-500 hover:text-zinc-300`}>Fermer</button>
            </div>
          )}

          {/* Options */}
          <div className="space-y-3 mb-4">
            {options[0]?.type === "forced-rest" && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="text-sm mb-3 text-zinc-300">Blessure en cours de soin — repos forcé ce cycle.</div>
                <button onClick={()=>chooseOption({type:"rest"})} className={`${BTN} bg-red-600 hover:bg-red-500 px-4 py-2 rounded-xl text-sm font-bold uppercase`}>Continuer la convalescence</button>
              </div>
            )}
            {options.find(o=>o.type==="cooldown") && (
              <div className="bg-zinc-900 border border-amber-800 rounded-xl p-4">
                <div className="font-bold text-amber-500 mb-1">🏋️ Camp de préparation en cours</div>
                <div className="text-xs text-zinc-400">
                  Pas de combat proposé cette semaine : impossible d'enchaîner les combats sans un vrai temps de récupération et de préparation.
                  Encore <span className="font-semibold text-zinc-200">{options.find(o=>o.type==="cooldown").weeksLeft}</span> semaine{options.find(o=>o.type==="cooldown").weeksLeft>1?"s":""} avant qu'un nouveau combat officiel ne soit proposé.
                </div>
              </div>
            )}
            {options.some(o=>o.type==="fight") && (
              <button onClick={()=>openPanel("worldmap")}
                className={`${BTN} w-full text-left bg-gradient-to-r from-sky-950 to-zinc-900 border border-sky-700 hover:border-sky-400 rounded-xl p-4`}>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold text-lg">🥊 {options.filter(o=>o.type==="fight").length} combat{options.filter(o=>o.type==="fight").length>1?"s":""} proposé{options.filter(o=>o.type==="fight").length>1?"s":""} cette semaine</div>
                    <div className="text-xs text-zinc-400 mt-1">Consulte la liste des combats proposés pour comparer villes, adversaires, styles et frais de déplacement avant de choisir.</div>
                  </div>
                  <span className="text-2xl">→</span>
                </div>
              </button>
            )}
            {options.find(o=>o.type==="rest") && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="font-bold mb-1">Repos & entraînement</div>
                <div className="text-xs text-zinc-500 mb-3">Pas de combat ce cycle : choisis ton intensité de la semaine.</div>
                <div className="mb-3">
                  <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
                    <span>Charge de travail hebdomadaire</span>
                    <span className={`font-bold ${(state.weeklyLoad||0)>=85?"text-red-500":(state.weeklyLoad||0)>=60?"text-amber-400":"text-emerald-400"}`}>{Math.round(state.weeklyLoad||0)}/100</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${(state.weeklyLoad||0)>=85?"bg-red-500":(state.weeklyLoad||0)>=60?"bg-amber-400":"bg-emerald-500"}`}
                      style={{ width: `${clamp(state.weeklyLoad||0,0,100)}%` }}
                    />
                  </div>
                  {(state.weeklyLoad||0)>=60 && (
                    <div className="text-[10px] text-amber-500 mt-1">⚠️ Au-delà de 60, le risque de blessure et de burnout grimpe fortement avec l'intensité choisie.</div>
                  )}
                </div>
                <div className="space-y-2">
                  {TRAINING_INTENSITIES.map(ti=>(
                    <button key={ti.id} onClick={()=>chooseOption({type:"rest", intensity:ti.id})}
                      className={`${BTN} w-full text-left bg-zinc-950 border border-zinc-800 hover:border-zinc-600 rounded-lg p-3`}>
                      <div className="font-semibold text-sm">{ti.label}</div>
                      <div className="text-[11px] text-zinc-500">{ti.short}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Log */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 max-h-40 overflow-y-auto text-xs space-y-1 text-zinc-400">
            {log.slice(-8).map((l,i)=>(<div key={i}>{l}</div>))}
          </div>
        </div>
      </div>
    );
  }

  if (phase === "coaching" && coachCareer){
    const cc = coachCareer;
    const resetCoach = ()=>{ setPhase("intro"); setName(""); setState(null); setLog([]); setHofSaved(false); setCoachCareer(null); };
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
        <style>{BOUNCE_STYLE}</style>
        <div className="max-w-lg w-full">
          <div className="text-xs tracking-widest text-emerald-500 font-bold mb-2 text-center">CARRIÈRE D'ENTRAÎNEUR</div>
          <h2 className="text-2xl font-black uppercase italic mb-1 text-center">{cc.gymName}</h2>
          <div className="text-zinc-500 text-sm mb-4 text-center">Saison {cc.season} · {cc.age} ans · Installations niveau {cc.facilityLevel}/3</div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 mb-4 text-xs space-y-2">
            <div>
              <div className="flex justify-between text-zinc-400 mb-1"><span>❤️ Santé</span><span>{cc.health}/100</span></div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden"><div className="h-full bg-red-500" style={{width:`${cc.health}%`}}/></div>
            </div>
            <div>
              <div className="flex justify-between text-zinc-400 mb-1"><span>⭐ Réputation</span><span>{cc.reputation}/100</span></div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden"><div className="h-full bg-yellow-500" style={{width:`${cc.reputation}%`}}/></div>
            </div>
            <div className="flex justify-between text-zinc-300 pt-1">
              <span>💰 Budget</span><span className={cc.budget<0?"text-red-400 font-semibold":"text-emerald-400 font-semibold"}>{eur(cc.budget)}</span>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4 grid grid-cols-3 gap-2 text-center">
            <div><div className="text-2xl font-black text-emerald-400">{cc.fightersTrained}</div><div className="text-[10px] text-zinc-500 uppercase">Combattants formés</div></div>
            <div><div className="text-2xl font-black text-yellow-400">{cc.championsProduced}</div><div className="text-[10px] text-zinc-500 uppercase">Champions produits</div></div>
            <div><div className="text-2xl font-black text-sky-400">{cc.ufcSignings||0}</div><div className="text-[10px] text-zinc-500 uppercase">Signatures pro</div></div>
          </div>

          {cc.prospects.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 mb-4 text-xs">
              <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Ton effectif</div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {cc.prospects.map((p,i)=>(
                  <div key={i} className="flex justify-between text-zinc-300">
                    <span>{"⭐".repeat(p.potential||1)} {p.name} {p.signed && "✍️"} {p.injured && "🩹"} {p.retired && "🔚"}</span>
                    <span className="text-zinc-500">{p.wins}V-{p.losses||0}D</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {cc.bankrupt ? (
            <div className="bg-zinc-900 border border-red-800 rounded-xl p-4 mb-4 text-center text-red-400 text-sm">
              💥 {cc.gymName} a fait faillite. Ton aventure d'entraîneur s'arrête ici.
            </div>
          ) : (
            <>
              <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Choisis l'axe de la saison</div>
              <div className="grid grid-cols-1 gap-2 mb-3">
                <button onClick={()=>advanceCoachingSeason("technique")}
                  className={`${BTN} w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-wide py-2.5 rounded-xl text-sm`}>
                  🥋 Perfectionnement technique <span className="font-normal normal-case text-emerald-200 text-[10px]">— meilleures victoires, moins de blessures</span>
                </button>
                <button onClick={()=>advanceCoachingSeason("scouting")}
                  className={`${BTN} w-full bg-sky-600 hover:bg-sky-500 text-white font-bold uppercase tracking-wide py-2.5 rounded-xl text-sm`}>
                  🔍 Recrutement & scouting <span className="font-normal normal-case text-sky-200 text-[10px]">— meilleurs prospects, signatures facilitées</span>
                </button>
                <button onClick={()=>advanceCoachingSeason("business")}
                  className={`${BTN} w-full bg-amber-600 hover:bg-amber-500 text-white font-bold uppercase tracking-wide py-2.5 rounded-xl text-sm`}>
                  📣 Business & sponsoring <span className="font-normal normal-case text-amber-200 text-[10px]">— revenus et image, entraînements moins poussés</span>
                </button>
              </div>
              {cc.facilityLevel < 3 && (
                <button onClick={upgradeGymFacility} disabled={cc.budget < 10000*cc.facilityLevel}
                  className={`${BTN} w-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 text-xs font-semibold uppercase tracking-wide py-2 rounded-xl mb-3`}>
                  🏗️ Agrandir la salle — {eur(10000*cc.facilityLevel)}
                </button>
              )}
            </>
          )}

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 max-h-56 overflow-y-auto text-xs text-left space-y-1 text-zinc-400 mb-4">
            {cc.log.map((l,i)=>(<div key={i}>{l}</div>))}
          </div>

          <button onClick={resetCoach}
            className={`${BTN} w-full bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-wide py-3 rounded-xl`}>
            Nouvelle carrière (combattant)
          </button>
        </div>
      </div>
    );
  }

  if (phase === "promoting" && promoterCareer){
    const pc = promoterCareer;
    const tvLabels = ["Aucun deal TV","Diffusion locale","Diffusion régionale","Diffusion nationale","Diffusion internationale"];
    const resetPromoter = ()=>{ setPhase("intro"); setName(""); setState(null); setLog([]); setHofSaved(false); setPromoterCareer(null); };
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
        <style>{BOUNCE_STYLE}</style>
        <div className="max-w-lg w-full">
          <div className="text-xs tracking-widest text-amber-500 font-bold mb-2 text-center">CARRIÈRE DE PROMOTEUR</div>
          <h2 className="text-2xl font-black uppercase italic mb-1 text-center">{pc.company}</h2>
          <div className="text-zinc-500 text-sm mb-4 text-center">Saison {pc.season} · {pc.age} ans · {tvLabels[pc.tvDealLevel]}</div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 mb-4 text-xs space-y-2">
            <div>
              <div className="flex justify-between text-zinc-400 mb-1"><span>❤️ Santé</span><span>{pc.health}/100</span></div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden"><div className="h-full bg-red-500" style={{width:`${pc.health}%`}}/></div>
            </div>
            <div>
              <div className="flex justify-between text-zinc-400 mb-1"><span>⭐ Réputation</span><span>{pc.reputation}/100</span></div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden"><div className="h-full bg-yellow-500" style={{width:`${pc.reputation}%`}}/></div>
            </div>
            <div className="flex justify-between text-zinc-300 pt-1">
              <span>💰 Budget</span><span className={pc.budget<0?"text-red-400 font-semibold":"text-emerald-400 font-semibold"}>{eur(pc.budget)}</span>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4 grid grid-cols-2 gap-2 text-center">
            <div><div className="text-2xl font-black text-amber-400">{pc.cardsRun}</div><div className="text-[10px] text-zinc-500 uppercase">Galas organisés</div></div>
            <div><div className="text-2xl font-black text-sky-400">{pc.bigNamesSigned}</div><div className="text-[10px] text-zinc-500 uppercase">Têtes d'affiche signées</div></div>
          </div>

          {pc.bankrupt ? (
            <div className="bg-zinc-900 border border-red-800 rounded-xl p-4 mb-4 text-center text-red-400 text-sm">
              💥 {pc.company} a déposé le bilan. Ton aventure de promoteur s'arrête ici.
            </div>
          ) : (
            <>
              <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Choisis le format du prochain gala</div>
              <div className="grid grid-cols-1 gap-2 mb-3">
                <button onClick={()=>advancePromoterSeason("small")}
                  className={`${BTN} w-full bg-zinc-700 hover:bg-zinc-600 text-white font-bold uppercase tracking-wide py-2.5 rounded-xl text-sm`}>
                  🎫 Gala régional <span className="font-normal normal-case text-zinc-300 text-[10px]">— peu coûteux, sûr, revenus modestes</span>
                </button>
                <button onClick={()=>advancePromoterSeason("ppv")}
                  className={`${BTN} w-full bg-amber-600 hover:bg-amber-500 text-white font-bold uppercase tracking-wide py-2.5 rounded-xl text-sm`}>
                  🎆 Gala PPV majeur <span className="font-normal normal-case text-amber-200 text-[10px]">— gros budget, gros risque, gros gain potentiel</span>
                </button>
                <button onClick={()=>advancePromoterSeason("theme")}
                  className={`${BTN} w-full bg-purple-700 hover:bg-purple-600 text-white font-bold uppercase tracking-wide py-2.5 rounded-xl text-sm`}>
                  🎭 Soirée à thème <span className="font-normal normal-case text-purple-200 text-[10px]">— coût moyen, misé sur l'image</span>
                </button>
              </div>
              {pc.tvDealLevel < 3 && (
                <button onClick={negotiateTvDeal} disabled={pc.budget < 8000*(pc.tvDealLevel+1)}
                  className={`${BTN} w-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 text-xs font-semibold uppercase tracking-wide py-2 rounded-xl mb-3`}>
                  📺 Négocier un deal TV — {eur(8000*(pc.tvDealLevel+1))}
                </button>
              )}
            </>
          )}

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 max-h-56 overflow-y-auto text-xs text-left space-y-1 text-zinc-400 mb-4">
            {pc.log.map((l,i)=>(<div key={i}>{l}</div>))}
          </div>

          <button onClick={resetPromoter}
            className={`${BTN} w-full bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-wide py-3 rounded-xl`}>
            Nouvelle carrière (combattant)
          </button>
        </div>
      </div>
    );
  }

  if (phase === "commentating" && commentatorCareer){
    const kc = commentatorCareer;
    const networkLabels = ["Indépendant","Diffuseur régional","Diffuseur national","Diffuseur international"];
    const resetCommentator = ()=>{ setPhase("intro"); setName(""); setState(null); setLog([]); setHofSaved(false); setCommentatorCareer(null); };
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
        <style>{BOUNCE_STYLE}</style>
        <div className="max-w-lg w-full">
          <div className="text-xs tracking-widest text-sky-500 font-bold mb-2 text-center">CARRIÈRE DE COMMENTATEUR</div>
          <h2 className="text-2xl font-black uppercase italic mb-1 text-center">{name}</h2>
          <div className="text-zinc-500 text-sm mb-4 text-center">Saison {kc.season} · {kc.age} ans · {networkLabels[kc.networkLevel]}</div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 mb-4 text-xs space-y-2">
            <div>
              <div className="flex justify-between text-zinc-400 mb-1"><span>❤️ Santé</span><span>{kc.health}/100</span></div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden"><div className="h-full bg-red-500" style={{width:`${kc.health}%`}}/></div>
            </div>
            <div>
              <div className="flex justify-between text-zinc-400 mb-1"><span>🎓 Crédibilité</span><span>{Math.round(kc.credibility)}/100</span></div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden"><div className="h-full bg-emerald-500" style={{width:`${clamp(kc.credibility,0,100)}%`}}/></div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4 grid grid-cols-3 gap-2 text-center">
            <div><div className="text-2xl font-black text-sky-400">{kc.audience}</div><div className="text-[10px] text-zinc-500 uppercase">Auditeurs</div></div>
            <div><div className="text-2xl font-black text-emerald-400">{kc.viralMoments}</div><div className="text-[10px] text-zinc-500 uppercase">Moments viraux</div></div>
            <div><div className="text-2xl font-black text-red-400">{kc.controversies}</div><div className="text-[10px] text-zinc-500 uppercase">Polémiques</div></div>
          </div>

          {kc.bankrupt ? (
            <div className="bg-zinc-900 border border-red-800 rounded-xl p-4 mb-4 text-center text-red-400 text-sm">
              📴 Ta chaîne a mis fin à ta collaboration. Ton aventure de commentateur s'arrête ici.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 mb-3">
              <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Choisis ton style pour le prochain cartel</div>
              <button onClick={()=>advanceCommentatorSeason("technique")}
                className={`${BTN} w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-wide py-2.5 rounded-xl text-sm`}>
                🧠 Analyse technique <span className="font-normal normal-case text-emerald-200 text-[10px]">— gains modestes, crédibilité en hausse</span>
              </button>
              <button onClick={()=>advanceCommentatorSeason("hype")}
                className={`${BTN} w-full bg-sky-600 hover:bg-sky-500 text-white font-bold uppercase tracking-wide py-2.5 rounded-xl text-sm`}>
                🔥 Show & hype <span className="font-normal normal-case text-sky-200 text-[10px]">— grosse audience, risque de polémique</span>
              </button>
              <button onClick={()=>advanceCommentatorSeason("controversial")}
                className={`${BTN} w-full bg-red-700 hover:bg-red-600 text-white font-bold uppercase tracking-wide py-2.5 rounded-xl text-sm`}>
                🗣️ Prise de position <span className="font-normal normal-case text-red-200 text-[10px]">— très clivant, gros coup ou gros bad buzz</span>
              </button>
            </div>
          )}

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 max-h-56 overflow-y-auto text-xs text-left space-y-1 text-zinc-400 mb-4">
            {kc.log.map((l,i)=>(<div key={i}>{l}</div>))}
          </div>

          <button onClick={resetCommentator}
            className={`${BTN} w-full bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-wide py-3 rounded-xl`}>
            Nouvelle carrière (combattant)
          </button>
        </div>
      </div>
    );
  }

  if (phase === "epilogue" && epilogue){
    const ep = epilogue;
    const s = state;
    const typeLabels = { coach:"entraîneur", promoter:"promoteur", commentator:"commentateur" };
    const typeStats = {
      coach: ep.stats ? [
        ["Combattants formés", ep.stats.fightersTrained],
        ["Champions produits", ep.stats.championsProduced],
        ["Signatures pro", ep.stats.ufcSignings||0],
        ["Gymnase", ep.stats.gymName],
      ] : [],
      promoter: ep.stats ? [
        ["Galas organisés", ep.stats.cardsRun],
        ["Têtes d'affiche signées", ep.stats.bigNamesSigned],
        ["Société", ep.stats.company],
      ] : [],
      commentator: ep.stats ? [
        ["Auditeurs cumulés", ep.stats.audience],
        ["Moments viraux", ep.stats.viralMoments],
        ["Polémiques", ep.stats.controversies],
      ] : [],
    }[ep.type] || [];
    const resetFromEpilogue = ()=>{
      setPhase("intro"); setName(""); setState(null); setLog([]); setHofSaved(false);
      setCoachCareer(null); setPromoterCareer(null); setCommentatorCareer(null); setEpilogue(null);
    };
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
        <style>{BOUNCE_STYLE}</style>
        <div className="max-w-lg w-full text-center">
          <div className="text-xs tracking-widest text-zinc-500 font-bold mb-2">🕯️ FIN DE VIE</div>
          <h2 className="text-3xl font-black uppercase italic mb-2">{name}</h2>
          <div className="text-zinc-400 text-sm mb-6">
            {ep.cause === "grand-age"
              ? `S'est éteint(e) paisiblement à ${ep.age} ans, entouré(e) des siens.`
              : `S'est éteint(e) à ${ep.age} ans, après une vie bien remplie.`}
          </div>

          {s && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4 text-left">
              <div className="text-xs uppercase tracking-widest text-zinc-500 mb-2">🥊 Carrière de combattant</div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-zinc-300">
                <div>Bilan : <span className="font-semibold">{s.wins}V-{s.losses}D</span></div>
                <div>Ceintures : <span className="font-semibold">{s.titles}</span></div>
              </div>
            </div>
          )}

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6 text-left">
            <div className="text-xs uppercase tracking-widest text-zinc-500 mb-2">Reconversion — {typeLabels[ep.type]}</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-zinc-300">
              {typeStats.map(([label,val],i)=>(<div key={i}>{label} : <span className="font-semibold">{String(val)}</span></div>))}
            </div>
          </div>

          <button onClick={resetFromEpilogue}
            className={`${BTN} w-full bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-wide py-3 rounded-xl`}>
            Commencer une nouvelle carrière
          </button>
        </div>
      </div>
    );
  }

  if (phase === "gameover" && state){
    const s = state;
    const sc = computeScore(s);
    const total = s.wins + s.losses;
    const winPct = total ? Math.round((s.wins/total)*100) : 0;
    const netWorth = (s.money||0) - (s.dette||0);
    const isHallOfFame = sc.total100 >= 75;
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
        <style>{BOUNCE_STYLE}</style>
        <div className="max-w-lg w-full text-center">
          <div className="text-xs tracking-widest text-red-500 font-bold mb-2">FIN DE CARRIÈRE</div>
          <h2 className="text-3xl font-black uppercase italic mb-1">{name}</h2>
          <div className="text-zinc-500 text-sm mb-6">Retraité à {s.age} ans · Bilan {s.wins}-{s.losses} · {s.titles} titre{s.titles>1?"s":""}</div>

          {isHallOfFame && (
            <div className="mb-4 bg-gradient-to-r from-yellow-600/20 via-yellow-500/10 to-yellow-600/20 border border-yellow-600 rounded-xl py-2 px-3 text-yellow-400 font-bold text-sm uppercase tracking-widest">
              🏛️ Intronisé au Hall of Fame
            </div>
          )}

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-4">
            <div className="text-7xl font-black text-red-500 leading-none">{sc.total100}</div>
            <div className="text-zinc-500 text-xs uppercase tracking-widest mb-2">/ 100</div>
            <div className="font-bold text-lg mb-1">{rankLabel(sc.total100)}</div>
            <div className="text-xs text-zinc-500 italic mb-4">{legacyLabel(sc.total100, s)}</div>
            <div className="text-left text-xs space-y-1 text-zinc-400">
              <div className="flex justify-between"><span>Titres</span><span>{sc.titlePts.toFixed(1)} / 40</span></div>
              <div className="flex justify-between"><span>Taux de victoire ({winPct}%)</span><span>{sc.winPts.toFixed(1)} / 25</span></div>
              <div className="flex justify-between"><span>Réputation</span><span>{sc.repPts.toFixed(1)} / 15</span></div>
              <div className="flex justify-between"><span>Gains cumulés</span><span>{sc.moneyPts.toFixed(1)} / 10</span></div>
              <div className="flex justify-between"><span>Santé à la retraite</span><span>{sc.healthPts.toFixed(1)} / 10</span></div>
              {sc.debtPts > 0 && <div className="flex justify-between text-red-500"><span>Dette impayée</span><span>-{sc.debtPts.toFixed(1)} / 8</span></div>}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4 text-left">
            <div className="text-xs uppercase tracking-widest text-zinc-500 mb-2">🏆 Palmarès</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-zinc-300">
              <div>Bilan : <span className="font-semibold">{s.wins}V - {s.losses}D</span> ({winPct}%)</div>
              <div>Ceintures : <span className="font-semibold">{s.titles}</span>{s.titlesWonOrgs?.length ? <span className="text-zinc-500"> ({s.titlesWonOrgs.join(", ")})</span> : null}</div>
              <div>KO : <span className="font-semibold">{s.koWins||0}</span></div>
              <div>TKO : <span className="font-semibold">{s.tkoWins||0}</span></div>
              <div>Soumissions : <span className="font-semibold">{s.subWins||0}</span></div>
              <div>Décisions : <span className="font-semibold">{s.decWins||0}</span></div>
              <div>Plus longue série de victoires : <span className="font-semibold text-emerald-400">{s.longestWinStreak||0}</span></div>
              <div>Plus longue série de défaites : <span className="font-semibold text-red-400">{s.longestLossStreak||0}</span></div>
              <div>Combats de l'année : <span className="font-semibold">{s.fightsOfTheYear||0}</span></div>
              <div>Techniques maîtrisées : <span className="font-semibold">{s.discoveredTechniques.length}/{TECHNIQUES.length}</span></div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4 text-left">
            <div className="text-xs uppercase tracking-widest text-zinc-500 mb-2">💰 Finances</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-zinc-300">
              <div>Gains totaux : <span className="font-semibold text-emerald-400">{eur(s.totalEarnings||0)}</span></div>
              <div>Plus gros cachet : <span className="font-semibold">{eur(s.biggestPurse||0)}</span></div>
              <div>Dépenses voyages/hôtels : <span className="font-semibold text-red-400">{eur(s.totalTravelSpent||0)}</span></div>
              <div>Dépenses coachs/staff : <span className="font-semibold text-red-400">{eur(s.totalStaffSpent||0)}</span></div>
              <div>Impôts payés : <span className="font-semibold text-red-400">{eur(s.totalTaxesPaid||0)}</span></div>
              <div>Dépenses matériel : <span className="font-semibold text-red-400">{eur(s.totalEquipmentSpent||0)}</span></div>
              <div>Solde net (fortune - dette) : <span className={`font-semibold ${netWorth>=0?"text-emerald-400":"text-red-400"}`}>{eur(netWorth)}</span></div>
              <div>Dette restante : <span className="font-semibold">{eur(s.dette||0)}</span></div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-yellow-700 rounded-xl p-4 mb-4 text-left">
            <div className="text-xs uppercase tracking-widest text-yellow-500 mb-2">🐐 Système de legacy (héritage)</div>
            {(() => {
              const legacy = computeLegacyScore(s);
              return (
                <>
                  <div className="flex items-baseline gap-3 mb-2">
                    <div className="text-4xl font-black text-yellow-400">{legacy.legacy100}</div>
                    <div className="font-bold text-sm">{legacy.tier}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-zinc-300">
                    <div>Titres remportés : <span className="font-semibold">{legacy.titles}</span></div>
                    <div>Défenses de ceinture : <span className="font-semibold">{legacy.defenses}</span></div>
                    <div>Victoires contre des légendes : <span className="font-semibold">{legacy.legendWins}</span></div>
                    <div>Plus longue invincibilité : <span className="font-semibold">{legacy.streak} combats</span></div>
                    <div>Finishes (KO/TKO/soumission) : <span className="font-semibold">{legacy.finishes}</span></div>
                    <div>Organisations où tu as été champion : <span className="font-semibold">{legacy.orgsCount}</span></div>
                  </div>
                </>
              );
            })()}
          </div>

          {hallOfFame.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4 text-left">
              <div className="text-xs uppercase tracking-widest text-zinc-500 mb-2">🏛️ Hall of Fame — anciennes légendes</div>
              <div className="text-[10px] text-zinc-600 mb-2">Ces combattants retraités pourront apparaître comme adversaires légendaires dans tes prochaines carrières.</div>
              <div className="space-y-1 text-xs text-zinc-300 max-h-32 overflow-y-auto">
                {hallOfFame.slice(0,10).map((h,i)=>(
                  <div key={i} className="flex justify-between">
                    <span>{h.name} <span className="text-zinc-600">({h.wins}V-{h.losses}D, {h.titles} titre{h.titles>1?"s":""})</span></span>
                    <span className="text-yellow-400 font-semibold">{h.legacyScore} · {h.tier}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4 text-left">
            <div className="text-xs uppercase tracking-widest text-zinc-500 mb-2">🩹 Corps et voyages</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-zinc-300">
              <div>Blessures subies : <span className="font-semibold">{s.injuryCount||0}</span></div>
              <div>Dont blessures graves : <span className="font-semibold text-red-400">{s.severeInjuryCount||0}</span></div>
              <div>Semaines passées blessé : <span className="font-semibold">{s.weeksInjuredTotal||0}</span></div>
              <div>Semaines d'entraînement : <span className="font-semibold">{s.weeksTrained||0}</span></div>
              <div>Pays visités : <span className="font-semibold">{(s.countriesVisited||[]).length}</span></div>
              <div>Santé finale : <span className="font-semibold">{Math.round(s.health)}/100</span></div>
            </div>
            {s.countriesVisited?.length ? <div className="text-[10px] text-zinc-600 mt-2">{s.countriesVisited.join(" · ")}</div> : null}
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 max-h-48 overflow-y-auto text-xs text-left space-y-1 text-zinc-500 mb-4">
            {log.map((l,i)=>(<div key={i}>{l}</div>))}
          </div>

          {viewingArchive && (
            <div className="mb-3 bg-zinc-900 border border-zinc-700 rounded-xl py-2 px-3 text-zinc-400 text-xs uppercase tracking-widest">
              📖 Consultation d'une carrière archivée
            </div>
          )}

          {!viewingArchive && (
            <>
              <button onClick={startCoachingCareer}
                className={`${BTN} w-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold uppercase tracking-wide py-3 rounded-xl mb-3`}>
                🏋️ Devenir entraîneur — former la nouvelle génération
              </button>

              <button onClick={startPromoterCareer}
                className={`${BTN} w-full bg-amber-700 hover:bg-amber-600 text-white font-bold uppercase tracking-wide py-3 rounded-xl mb-3`}>
                🎪 Devenir promoteur — organiser des galas
              </button>

              <button onClick={startCommentatorCareer}
                className={`${BTN} w-full bg-sky-700 hover:bg-sky-600 text-white font-bold uppercase tracking-wide py-3 rounded-xl mb-3`}>
                🎙️ Devenir commentateur — prendre le micro
              </button>
            </>
          )}

          <button onClick={viewingArchive ? backToIntroFromArchive : (()=>{ setPhase("intro"); setName(""); setState(null); setLog([]); setHofSaved(false); })}
            className={`${BTN} w-full bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-wide py-3 rounded-xl`}>
            {viewingArchive ? "← Retour à l'accueil" : "Nouvelle carrière"}
          </button>
        </div>
      </div>
    );
  }

  // Filet de sécurité : si aucun écran ne correspond exactement à la phase courante (par ex.
  // un très bref instant entre deux mises à jour d'état), on affiche une transition neutre
  // plutôt qu'un écran totalement vide, qui donnait l'impression qu'un clic n'avait rien fait.
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-500 flex items-center justify-center p-6 text-sm">
      Chargement…
    </div>
  );
}
