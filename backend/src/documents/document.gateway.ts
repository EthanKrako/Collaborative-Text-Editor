import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway()
export class DocumentGateway {
    @SubscribeMessage('join-document')
    handleJoinDocument(@ConnectedSocket() client: Socket, @MessageBody() data: { documentId: string }) {
        client.join(`doc-${data.documentId}`);
    }
}

