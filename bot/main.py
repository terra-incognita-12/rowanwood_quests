import logging
import asyncio
from urllib import response
import requests

from telegram import (
	InlineKeyboardButton, 
	InlineKeyboardMarkup, 
	Update,
	BotCommand,
)
from telegram.ext import (
	Application,
	CallbackQueryHandler,
	CommandHandler,
	ContextTypes,
	ConversationHandler,
)

BACKEND_URL = 'http://127.0.0.1:8000'
QUEST_URL = 'bad_day'
TOKEN='5962491186:AAERx0YPEL2kbOsKhYywIeP-7J9xCRpjcL4'

NEXT_STEP = 1

logging.basicConfig(
	format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
	level=logging.INFO
)
logger = logging.getLogger(__name__)

def get_quest_info():
	try:
		response = requests.get(f'{BACKEND_URL}/quest/{QUEST_URL}')
		data = response.json()
		return data
	except requests.exceptions.RequestException as e:
		print(e)
	
	return "error"

# Get line API
def get_line(unique_number: int):
	try:
		response = requests.get(f'{BACKEND_URL}/quest/lines/{QUEST_URL}/{unique_number}')
		data = response.json()
		return data
	except requests.exceptions.RequestException as e:
		print(e)
	
	return "error"

# BOT FUNCTIONS
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
	user = update.message.from_user
	
	logger.info(f'User {user.first_name} started the conversation.')
	
	quest_info = get_quest_info()
	first_line = get_line(1)

	await update.message.reply_text(f'Hello {user.first_name}! Welcome to the Arena by Rowan Wood')

	await update.message.reply_text(f"QUEST INFO \n\n {quest_info['full_description']} \n\n")

	keyboard = []
	for elem in first_line['quest_current_options']:
		keyboard.append([InlineKeyboardButton(elem['name'], callback_data=elem['quest_next_line']['unique_number'])])

	reply_markup = InlineKeyboardMarkup(keyboard)
	await update.message.reply_text(first_line['description'], reply_markup=reply_markup)

	return NEXT_STEP

async def next_step(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
	query = update.callback_query
	await query.answer()

	current_line = get_line(int(query.data))

	keyboard = []
	for elem in current_line['quest_current_options']:
		keyboard.append([InlineKeyboardButton(elem['name'], callback_data=elem['quest_next_line']['unique_number'])])

	reply_markup = InlineKeyboardMarkup(keyboard)
	await query.message.reply_text(current_line['description'], reply_markup=reply_markup)
	if not keyboard:
		await query.message.reply_text('To restart quest again push /start', reply_markup=reply_markup)
		return ConversationHandler.END

	return NEXT_STEP

def main():
	application = Application.builder().token(TOKEN).build()

	commands = [
		BotCommand(command='/start', description='Start and restart quest')
	]

	quest_handler = ConversationHandler(
		entry_points=[CommandHandler("start", start)],
		states={
			NEXT_STEP: [
				CallbackQueryHandler(next_step),
			],
		},
		fallbacks=[CommandHandler("start", start)],
	)

	application.add_handler(quest_handler)
	application.updater.bot.set_my_commands(commands)

	application.run_polling()

if __name__ == '__main__':
	main()