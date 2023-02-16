import { useState, useEffect } from "react"
import { useSearchParams, Link } from "react-router-dom";
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Stack from '@mui/material/Stack';

import axios from "../../api/axios"
import HeadQuote from "../HeadQuote"

const Library = () => {
	let [searchParams, setSearchParams] = useSearchParams();

	let tagParam = searchParams.get("tag")

	const [records, setRecords] = useState([])

	const [pickedRecord, setPickedRecord] = useState("")
	const [inputPickedRecord, setInputPickedRecord] = useState("")
	
	const [tags, setTags] = useState([])

	const [dropDownTags, setDropDownTags] = useState([])
	const [pickedTag, setPickedTag] = useState("")

	const [searchRecords, setSearchRecords] = useState([])
	const [searchResult, setSearchResult] = useState(false)

	// Functionality to sort all records by the first letter
	let listLetter = ""
	const setListLetter = (letter) => {
		listLetter = letter
	}

	useEffect(() => {
		let isMounted = true
		const controller = new AbortController()
	
		const getRecords = async () => {
		try {
			const response = await axios.get("/library/records/all", {
				signal: controller.signal
			})

			isMounted && setRecords(response.data)
		} catch (err) {
			console.log(err)
		}
	}

	const getTags = async () => {
		try {
			const response = await axios.get("/library/tags/all", {
				signal: controller.signal
			})

			let searchTagsData = []
			let tagsOnlyName = []
		
			for (const tag of response.data) {
					tagsOnlyName.push({"name": tag.name})
			}
		
			// If page opened with get-request tag
			if (tagParam) {
				for (const tag of response.data) {
					if (tag.name === tagParam) {
						for (const record of tag.library_records) {
							searchTagsData.push(record)
						}
					}
				}
			}
		
			if (isMounted) {
				setTags(response.data)
				setDropDownTags(tagsOnlyName)
				setSearchRecords(searchTagsData)
			}
		} catch (err) {
				console.log(err)
		}
	}

	getRecords()
	getTags()

	return () => {
		isMounted = false
		controller.abort()
		if (tagParam) {
			setSearchResult(true)
		}
	}}, [])

	const getMatchingRecords = () => {
		let searched_records = []
		if (pickedRecord) {
			searched_records = records.filter(elem => elem.name.toLowerCase().includes(pickedRecord.name.toLowerCase()))
			setPickedRecord("")
		} else {
			searched_records = records.filter(elem => elem.name.toLowerCase().includes(inputPickedRecord.toLowerCase()))
		}
		
		if (searchParams.has("tag")) {
			searchParams.delete("tag")
			setSearchParams(searchParams)
		}
		
			setSearchRecords(searched_records)
			setSearchResult(true)
	}

	const getRecordsByTag = () => {
		let records = []
		for (const tag of tags) {
			if (tag.name === pickedTag.name) {
				for (const record of tag.library_records) {
					records.push(record)
				}
			}
		}
		
		if (searchParams.has("tag")) {
			searchParams.delete("tag")
			setSearchParams(searchParams)
		}
		
		setSearchRecords(records)
		setSearchResult(true)
	}

	return (
		<div className="mt-3">
			<HeadQuote quote="SAPIENTIA POTENTIA EST" translation="Wisdom is power"/>
			<Row>
		<Col xs={12} md={6}>
			<Stack spacing={2} direction="row">
				<Autocomplete fullWidth
						disablePortal
						freeSolo
						options={records}
						onChange={(e, newValue) => {
							setPickedRecord(newValue)
						}}
						onInputChange={(e, newInputValue) => {
							setInputPickedRecord(newInputValue)
						}}
						getOptionLabel={(option) => option.name || ""}
						renderInput={(params) => <TextField fullWidth {...params} label="Search by Records" />}
				/>
				<Button variant="contained" color="primary" size="large" onClick={getMatchingRecords}>Search</Button>
			</Stack>
		</Col>
		<Col xs={12} md={6}>
				<Stack spacing={2} direction="row">
				<Autocomplete fullWidth
				disablePortal
				options={dropDownTags}
				onChange={(e, newValue) => {
					setPickedTag(newValue)
				}}
				getOptionLabel={(option) => option.name}
				renderInput={(params) => <TextField fullWidth {...params} label="Search by Tags" />}
			/>
	<Button variant="contained" color="primary" size="large" onClick={getRecordsByTag}>Search</Button>
			</Stack>
		</Col>
			</Row>
			{searchResult
		?
		(
				<Row>
			<Card className="mt-3">
					<CardContent>
				<Typography gutterBottom variant="h5">Search Results</Typography>
				{searchRecords.length
						?
						searchRecords.map((record, i) =>
					<div key={i}>
							<Button component={Link} to={`${record.url}`} variant="text">{record.name}</Button>
					</div>
						) : <Typography gutterBottom variant="h7">No results found</Typography>
				}
					</CardContent>
			</Card>
				</Row>
		)
		: null

			}
			<Row>
		<Card className="mt-3">
			<CardContent>
				<Typography gutterBottom variant="h4">All Records</Typography>
					{records.map((record, i) =>
						<div key={i}>
							{record.name.charAt(0) === listLetter
								?
								<Button component={Link} to={`${record.url}`} variant="text">{record.name}</Button>
								:
								<div className="mt-4">
									{setListLetter(record.name.charAt(0))}
									<Typography gutterBottom variant="h5">{record.name.charAt(0)}</Typography>
									<hr/>
									<Button component={Link} to={`${record.url}`} variant="text" size="large">{record.name}</Button>
								</div>
							}
						</div>
					)}
				</CardContent>
			</Card>
		</Row>
	</div>
	)
}

export default Library