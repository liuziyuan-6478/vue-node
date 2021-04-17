const AlipayFormData = require('alipay-sdk/lib/form').default
const AlipaySdk = require('alipay-sdk').default
const alipaySdk = new AlipaySdk({
    appId: '2021000117633840',
    gateway: 'https://openapi.alipaydev.com/gateway.do',
    privateKey: 'MIIEogIBAAKCAQEAjKMj2tMo6g5y4wmqkzK1YV+StzLw04R96mwKP5+1aMWTwBrYM8LdccubqLGW/OHnPhFOkRV+5zx+xzMv7Z+7tnLHqLH1//J6hK3I2jV5twVWx5K62JYeAZMbG2QAZp+OrKv44F6s+0QEFIlUAVamn77HFPlGP/ObUOl+018/w22G9G/JVs+5Z3hoJhq4sJWu+mbdU+TyAqrlSrefxX+3ORKWtjTGpf7rTlawIt+Z1BfHdLrL0YPm4+dH5K3QRoF+jl7FiCeqjBjbIT1hsVN1UCAUGDanHk6G+ii8X1wBH95wRKnlXvUp67HVBmjBZtG58AtJcSrCobIpBwHftpj43wIDAQABAoIBAAV2HGFWC+Oy9fEtIeufb329iWQF3WZJYd5lnaxE1nWgHpG6OSUhbxoJLx1I8DUXzLQTVfq6W/g82CuCKF1Q86gtIuXBK21qDCn02bTnmLdrxKfxYcIhaj7jaI0SwBU8Iv0/nGWSJ6OGS6ZEgveeVtAjR3XgDENVgXWN67fnngFHw5B1hWWVrFTsJSWAfWbZRVfwCdPbxBXdRtW/M9iOcHKMp4UyIZW8wsabCKi5j6uUkpEOfgS2/S1VzO2zLQJorzScXFT1aEEA6SUhazZ0QmFrwx1K2jXnu5qyy+JswqXHQDVi1BoEeO83QFQ7g3JEIMbesPz8AitdsgHmbZE4FrECgYEA5ejMXqfpKUQjQaIrSSr4OiqGsUqmt1I0Khre7Pd1HtTMYxWnlQ5lH3S4fXJmddD1ZAVBaEuZbjTJ6zIxBf1PSVN7xipRqxhY7fLYjlOhzGsu75jHjyBzeivs7sjbhVaCDPKTtDcUahAlrikEaO9WYPUetvC3t5mF7JboBS2ph8kCgYEAnJjbdaMGKBGUt0yMECEPAJw8ImPQfeuS7S1ttlmHumRdVIjyteFmCq57+JKtNMvi5tetyc07qG5wHuKPBq5re2lnE8ELFnIfrDJClznv8PLPFumo4cxfEpiuA5UHXdt6Keuu1nCL21mROiEavxcPNaxq04PeqIRqD52fyq1iH2cCgYBza2S2HGu0WM2uVICQke7eHJ1UAhsiKzWe8bB6nFyC5ufY0nU4Imrn2MwJxlXjzcxzsyO7/UAAkKXR2ne7/wg/0pZvzK0FTQrQIjtPcHLo0eJVTIjatLrkWYrv8YwrK1vMrjcyoPgxqvuPrG3XVFg0ArqxsrU4ie0u8i928g6K6QKBgCxGJ14WDmqLtfExCjSRNC2m/nV2pP7E+NBn1KoGnBI9yAlbgsubg38nn9NCnQfdUTSU7ASvKtvPBZIl2ew4qhjFTyhNnvXkpEHKH/ujnMwRyi0fOOlGH+chFanbm66Um/B4OwFT5qbIpv+5VleKjHlPWxCcKvqYHWh21zO1W5WnAoGAR+m0vIa32mcQ4rBTJy3Y42+UmwEv8h0eYW0xHSmcIZnOAaRhxjyMP8iQZmDbE+x1UqhBdUgBtz6ph83FYsG7NKfqOPDz6kxPreQPHKOo7mO7pELfxmbWlEzkdzcXJDvnZLI4/Rd+A5dF/Gx5W11jqK/GlUJqmRvB0kEpGQvfHMQ=',
    alipayPublicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAkqNxb/95WQTpF+uTMjv/oLnGI5yDwhlrIJMNSaUbPbrdu9FudaBB/rAF9eRduL3QYl11pyWtIircfGRs0786jdEr442cT7TVWUXb4wGlBgBd2gUFpyHK2f8rcCahXlDHGh9MXiEd4UFiL+DMRfTEMAF1JSSK/SS+y1aicAFQqUVUk2eb/FykO9yp7cVDXaNg+hHPU4WprBhDcpUOwruegxde0EW+xawsLzZ0dui4Q022KMRWgW/G33Tgq+JDTRVjjsbQkJARX4+QvbfVUg2Qe2MDllu7wLEqOP40j0P1/rEr9dCGIdAdj40Kj60cVgFkeqhPr75fQwmLXE9vhkSpGwIDAQAB'
})

// pay(Date.now().toString(), '0.1')

async function pay(orderNo, price) {
    const formData = new AlipayFormData()
  formData.setMethod('get')
  formData.addField('returnUrl', 'http://localhost:8080/#/orderSuccess?orderId=' + orderNo)
    formData.addField('notifyUrl', "http://localhost:2000/user/pay/notify")
  formData.addField('bizContent', {
    outTradeNo: orderNo,
    productCode: 'FAST_INSTANT_TRADE_PAY',
    totalAmount: price,
    subject: '商品',
    body: '商品详情',
  });
  return await alipaySdk.exec(
    'alipay.trade.page.pay',
    {},
    { formData: formData },
  );
}

module.exports = pay;