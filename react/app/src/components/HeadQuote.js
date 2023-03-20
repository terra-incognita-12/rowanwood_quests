import vexilloid from "../img/vexilloid.png"

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const HeadQuote = ({ quote, translation }) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between' }} className="mb-3">
      <Box
        component="img"
        sx={{ height: 125, width: 125, backgroundColor: "transparent", mr: {xs: 2, sm: 0} }}
        alt="Photo"
        src={vexilloid}
      />
      <Box>
        <Typography variant="h4" display="flex" justifyContent="center" alignItems="center">{quote}</Typography>
        <Typography gutterBottom variant="h6" display="flex" justifyContent="center" alignItems="center" className="quattro" color="text.secondary">{translation}</Typography>
      </Box>
      <Box
        component="img"
        sx={{ height: 125, width: 125, backgroundColor: "transparent", display: { xs: 'none', sm: 'block' } }}
        alt="Photo"
        src={vexilloid}
      />
    </Box>
  )
}

export default HeadQuote