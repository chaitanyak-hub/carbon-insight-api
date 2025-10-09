export interface TeamMember {
  name: string;
  email: string;
}

export interface Team {
  name: string;
  lead: string;
  members: TeamMember[];
}

export const TEAMS: Team[] = [
  {
    name: "Team Adam Parkins",
    lead: "Adam Parkins",
    members: [
      { name: "Amanda Adams", email: "amanda.adams@edfenergy.com" },
      { name: "Ben Houston", email: "ben.houston@edfenergy.com" },
      { name: "Danny Cotton", email: "danny.cotton@edfenergy.com" },
      { name: "Darren Manning", email: "darren.manning@edfenergy.com" },
      { name: "David Maddox", email: "david.maddox@edfenergy.com" },
      { name: "Dean Lipscombe", email: "dean.lipscombe@edfenergy.com" },
      { name: "Sarina Montesini", email: "sarina.montesini@edfenergy.com" },
      { name: "Sophie Michael", email: "sophie.michael@edfenergy.com" },
    ],
  },
  {
    name: "Team Rikki Nealgrove",
    lead: "Rikki Nealgrove",
    members: [
      { name: "Amy Randall", email: "amy.randall@edfenergy.com" },
      { name: "Chris Langridge", email: "chris.langridge@edfenergy.com" },
      { name: "Daniel Kearney", email: "daniel.kearney@edfenergy.com" },
      { name: "Catherine Hendon", email: "catherine.hendon@edfenergy.com" },
      { name: "Jennifer Hall", email: "jennifer.hall@edfenergy.com" },
      { name: "Luke Hudson-Young", email: "luke.hudson-young@edfenergy.com" },
      { name: "Matt Fricker", email: "matt.fricker@edfenergy.com" },
      { name: "Mitchell Dawes", email: "mitchell.dawes@edfenergy.com" },
      { name: "Sophie Kingston", email: "sophie.kingston@edfenergy.com" },
    ],
  },
  {
    name: "Team Joe Green",
    lead: "Joe Green",
    members: [
      { name: "Agata Siadura", email: "agata.siadura@edfenergy.com" },
      { name: "Andrew Tait", email: "andrew.tait@edfenergy.com" },
      { name: "Emma George", email: "emma.george@edfenergy.com" },
      { name: "Grace Mitchell", email: "grace.mitchell@edfenergy.com" },
      { name: "Jack Jeffrey", email: "jack.jeffrey@edfenergy.com" },
      { name: "Milchyas Ephrem", email: "milchyas.ephrem@edfenergy.com" },
      { name: "Pam Maglennon", email: "pam.maglennon@edfenergy.com" },
      { name: "Pete Emerson", email: "pete.emerson@edfenergy.com" },
      { name: "Sam Smith", email: "sam.smith@edfenergy.com" },
      { name: "Thomas Oake", email: "thomas.oake@edfenergy.com" },
    ],
  },
  {
    name: "Team Tuesday Jamieson",
    lead: "Tuesday Jamieson",
    members: [
      { name: "David Monk", email: "david.monk@edfenergy.com" },
      { name: "Jenny Norris", email: "jenny.norris@edfenergy.com" },
      { name: "Kelly Howell", email: "kelly.howell@edfenergy.com" },
      { name: "Gwyn Lewis", email: "gwyn.lewis@edfenergy.com" },
      { name: "Lauren Wise", email: "lauren.wise@edfenergy.com" },
      { name: "Martin House", email: "martin.house@edfenergy.com" },
      { name: "Ben Wybrow", email: "ben.wybrow@edfenergy.com" },
      { name: "Carli Bird", email: "carli.bird@edfenergy.com" },
      { name: "Orlando Nogueir", email: "orlando.nogueir@edfenergy.com" },
    ],
  },
];

export const getTeamForAgent = (agentEmail: string): string | null => {
  for (const team of TEAMS) {
    const member = team.members.find(
      (m) => m.email.toLowerCase() === agentEmail.toLowerCase()
    );
    if (member) {
      return team.name;
    }
  }
  return null;
};
