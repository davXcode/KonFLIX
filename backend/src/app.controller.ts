import { Controller, Get, Req, Res, HttpException } from '@nestjs/common';
import axios from 'axios';
import { Response } from 'express';

const BASE = 'https://api.sansekai.my.id/api';

@Controller('api')
export class AppController {
  @Get('*')
  async proxy(@Req() req: any, @Res() res: Response) {
    try {
      // 1. Ambil path asli tanpa prefix /api
      const path = req.params[0] ? req.params[0] : '';

      // 2. Bangun URL tujuan dengan mempertahankan Query String (?platform=xxx dll)
      const queryString = req.url.includes('?')
        ? req.url.substring(req.url.indexOf('?'))
        : '';
      const targetUrl = `${BASE}/${path}${queryString}`;

      const response = await axios.get(targetUrl);

      // 3. Kirim balik data ke client
      return res.status(response.status).json(response.data);
    } catch (error) {
      const status = error.response?.status || 500;
      const data = error.response?.data || { message: 'Internal Server Error' };
      return res.status(status).json(data);
    }
  }
}
