import { useParams } from "react-router"
import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"

import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import axios from "../../api/axios"

const LibraryDetails = () => {
	const { url } = useParams()
	const [record, setRecord] = useState("")
	const navigate = useNavigate()

	const isSmallScreen = useMediaQuery(theme => theme.breakpoints.down("sm"));

	useEffect(() => {
		let isMounted = true
		const controller = new AbortController()

		const getRecord = async () => {
				
			try {
				const response = await axios.get(`/library/records/${url}`, {
					signal: controller.signal
				})
				isMounted && setRecord(response.data)
			} catch (err) {
				if (err?.response?.status === 404) {
					navigate(`/notexist?err=${err?.response?.data?.detail}`)
				} else {
					console.log(err)
				}
			}
		}

		getRecord()

		return () => {
			isMounted = false
			controller.abort()
		}
	}, [])

	return (
		<div className="mt-3">
			<Button component={Link} to="/library" variant="text" size="large">&lt;&lt; Back</Button>
				<Card className="mt-3">
					<CardContent>
						<Typography gutterBottom variant="h4" display="flex" justifyContent="center" alignItems="center">{record.name}</Typography>
						{record.photo
							? (
							<Box className="figure w-150 float-end m-3">
								<Box
									component="img"
									sx={{
										height: 550,
										width: 550,
										maxHeight: { xs: 200, sm: 400, md: 450, lg: 550 },
										maxWidth: { xs: 200, sm: 400, md: 450, lg: 550 },
									}}
									alt="Photo"
									src={record.photo}
									className="figure-img img-fluid rounded img-thumbnail"
								/>
							</Box>
							) : null
						}
								
						<Typography
							gutterBottom
							variant="body1"
							sx={isSmallScreen
								? { p: 3 }
								: { p: 1 }
							}
						>
							{record.description}
						</Typography>

						{record.library_tags?.length
							?
							record.library_tags.map((tag, i) =>
								<Button component={Link} to={`/library?tag=${tag.name}`} key={i} variant="text">#{tag.name} </Button>
							) : null
						}
				</CardContent>
			</Card>
		</div>
	)
}

export default LibraryDetails