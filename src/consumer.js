import * as dotenv from "dotenv";
dotenv.config();
import amqp from "amqplib";
import PlaylistsService from "./services/playlistsService.js";
import MailSender from "./mailSender.js";
import Listener from "./listener.js";

const init = async () => {
  const playlistsService = new PlaylistsService();
  const mailSender = new MailSender();
  const services = {
    playlistsService,
  };
  const senders = {
    mailSender,
  };
  const listener = new Listener(services, senders);

  const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
  const channel = await connection.createChannel();

  await channel.assertQueue("export:playlists", {
    durable: true,
  });

  channel.consume("export:playlists", listener.listen, { noAck: true });
  console.log("Consumer server running");
};
init();
