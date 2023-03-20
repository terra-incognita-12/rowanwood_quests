import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

import HeadQuote from "../HeadQuote"

const About = () => {

	return (
	<div className="mt-3">
		<HeadQuote quote="OMNE INITIVM DIFFICILE EST" translation="Every beginning is difficult" />
		<Card className="mt-3">
			<CardContent>
				<Typography gutterBottom variant="h5" display="flex" justifyContent="center" alignItems="center" color="text.secondary">Welcome to Rowan Wood Quests!</Typography>
				<Typography gutterBottom variant="h6">Rowan Wood project - are the text quests in Telegram Messenger, based on a Telegram Bot service. Go to Home page and pick up quest, that's looking interesting for you. It will have Telegram Bot name in the description. Enjoy!</Typography>
				<hr/>
				<Typography gutterBottom variant="h6" color="text.secondary">INSTRUCTIONS</Typography>
				<Typography gutterBottom variant="h6" sx={{ "font-style": "oblique" }}>1) To play a quest - add Telegram bot with a given name under "Telegram address"</Typography>
				<Typography gutterBottom variant="h6" sx={{ "font-style": "oblique" }}>2) You can register to leave your comments in quest description</Typography>
				<Typography gutterBottom variant="h6" sx={{ "font-style": "oblique" }}>3) Use the library section to get more information about certain details inside the quest</Typography>
			</CardContent>
		</Card>
	</div>
	)
}

export default About