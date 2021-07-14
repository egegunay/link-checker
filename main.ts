import { CHANNEL, TOKEN } from './token.json';
import { Client } from 'discord.js';
import ytdl = require('ytdl-core');

const client = new Client();
const prefix = "checklinks"
let ytlinks = []
let linkstocheck = []

client.once('ready', () => {
	console.info(`${client.user.tag} is back, you mortals.`)
	client.user.setPresence({activity:{type: 'WATCHING', name: `for your playlists`}, status:'online'})
})

client.on('message', async (msg) => {
	if (!msg.content.startsWith(prefix) || msg.author.bot || !msg.member) return;
	const channel = client.channels.resolve(CHANNEL)
	if (!channel.isText()) return

	channel.messages.fetch().then(messages => {
		messages.forEach(msg => {
			ytlinks.push(msg.content)
		})
	}).then(() => {
		
	for (let index = 0; index < ytlinks.length - 1; index++) {
		const element = new String(ytlinks[index]) 
		if (element.startsWith('-p')) {

			linkstocheck.push(element.replace(/ /g, "").slice('-p'.length)) 
		}
	}
	}).then(() => {

		linkstocheck.forEach(link => {
			ytdl.getInfo(link).catch(() => {		
				msg.channel.send(`This link does not work! ${link}`)
			}).then(() => {
				ytlinks = []
				linkstocheck = []
			} )
		})
	})
})

client.login(`${TOKEN}`)