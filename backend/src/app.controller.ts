import { Controller, Get, Req, Res, Query } from '@nestjs/common';
import axios from 'axios';
import { Response } from 'express';
// import * as srt2vtt from 'srt-to-vtt';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const srt2vtt = require('srt-to-vtt');

import { Readable } from 'stream';

const BASE = 'https://api.sansekai.my.id/api';

@Controller('api')
export class AppController {
  // ==========================
  // 🔥 SUBTITLE CONVERTER PROXY
  // ==========================
  @Get('subtitle')
  async subtitle(@Query('url') url: string, @Res() res: Response) {
    try {
      if (!url) {
        return res.status(400).send('Missing url');
      }

      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
          Referer: 'https://www.google.com',
        },
      });

      const srtBuffer = Buffer.from(response.data);

      res.setHeader('Content-Type', 'text/vtt');

      const stream = Readable.from(srtBuffer);
      stream.pipe(srt2vtt()).pipe(res);
    } catch (err) {
      console.error('SUBTITLE PROXY ERROR:', err.message || err);
      return res.status(500).send('Failed to load subtitle');
    }
  }

  // ==========================
  // 🎬 SIMILAR MOVIES
  // ==========================
  @Get('moviebox/detail-rec')
  async similar(
    @Query('subjectId') subjectId: string,
    @Query('page') page = '1',
    @Query('perPage') perPage = '12',
    @Res() res: Response
  ) {
    try {
      if (!subjectId) {
        return res.status(400).json({ message: 'Missing subjectId' });
      }

      const url = `https://h5-api.aoneroom.com/wefeed-h5api-bff/subject/detail-rec?subjectId=${subjectId}&page=${page}&perPage=${perPage}`;

      const response = await axios.get(url, {
        headers: {
          Referer: 'https://h5.aoneroom.com',
          Origin: 'https://h5.aoneroom.com',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
        },
      });

      return res.json(response.data);
    } catch (err) {
      console.error('SIMILAR ERROR:', err.message || err);
      return res.status(500).json({ message: 'Failed to load similar movies' });
    }
  }

  // ==========================
  // 🌐 API PROXY
  // ==========================
  @Get('*')
  async proxy(@Req() req: any, @Res() res: Response) {
    try {
      const path = req.params[0] ? req.params[0] : '';
      const queryString = req.url.includes('?')
        ? req.url.substring(req.url.indexOf('?'))
        : '';
      const targetUrl = `${BASE}/${path}${queryString}`;

      const response = await axios.get(targetUrl);

      return res.status(response.status).json(response.data);
    } catch (error) {
      const status = error.response?.status || 500;
      const data = error.response?.data || { message: 'Internal Server Error' };
      return res.status(status).json(data);
    }
  }
}
