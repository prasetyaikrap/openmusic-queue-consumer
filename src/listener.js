export default class Listener {
  constructor(services, senders) {
    this._playlistsService = services.playlistsService;
    this._mailSender = senders.mailSender;
    this.listen = this.listen.bind(this);
  }

  async listen(message) {
    try {
      const { userId, playlistId, targetEmail } = JSON.parse(
        message.content.toString()
      );
      const playlist = await this._playlistsService.getPlaylist(
        playlistId,
        userId
      );
      const result = await this._mailSender.sendEmail(
        targetEmail,
        JSON.stringify(playlist)
      );

      console.log(result, playlist);
    } catch (err) {
      console.error(err);
    }
  }
}
