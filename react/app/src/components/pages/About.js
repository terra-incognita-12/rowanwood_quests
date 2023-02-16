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
				<Typography gutterBottom variant="h6" color="text.secondary">ANTONIVS GAIVS ADMINVS TO BRAVE TRAVELLER</Typography>
				<Typography gutterBottom variant="h6" sx={{ "font-style": "oblique" }}>Hello o brave guest of my virtual coliseum</Typography>
			</CardContent>
		</Card>
	</div>
	)
}

export default About