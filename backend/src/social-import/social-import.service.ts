import { Injectable, NotFoundException } from '@nestjs/common';

type DemoSocialStore = {
  name: string;
  description: string;
  logo: string;
  banner: string;
  category: string;
  phone?: string;
  email?: string;
  address?: string;
  socialLink: string;
};

type DemoSocialProduct = {
  name: string;
  description: string;
  image: string;
  price: number;
  stock: number;
  category: string;
  caption: string;
  socialLink: string;
};

const DEMO_NOT_FOUND_MESSAGE =
  'Demo social data not found. Please use one of the demo links.';

const demoSocialStores = require('../../data/demoSocialStores') as Record<
  string,
  DemoSocialStore
>;
const demoSocialProducts = require('../../data/demoSocialProducts') as Record<
  string,
  DemoSocialProduct
>;

@Injectable()
export class SocialImportService {
  private readonly storeLookup = this.createLookup(demoSocialStores);
  private readonly productLookup = this.createLookup(demoSocialProducts);

  findStore(url: string): DemoSocialStore {
    const store = this.storeLookup.get(this.normalizeUrl(url));

    if (!store) {
      throw new NotFoundException(DEMO_NOT_FOUND_MESSAGE);
    }

    return store;
  }

  findProduct(url: string): DemoSocialProduct {
    const product = this.productLookup.get(this.normalizeUrl(url));

    if (!product) {
      throw new NotFoundException(DEMO_NOT_FOUND_MESSAGE);
    }

    return product;
  }

  private createLookup<T extends { socialLink: string }>(
    data: Record<string, T>,
  ): Map<string, T> {
    const lookup = new Map<string, T>();

    Object.entries(data).forEach(([url, value]) => {
      lookup.set(this.normalizeUrl(url), value);
      lookup.set(this.normalizeUrl(value.socialLink), value);
    });

    return lookup;
  }

  private normalizeUrl(url = ''): string {
    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      return '';
    }

    try {
      const parsedUrl = new URL(trimmedUrl);
      parsedUrl.hash = '';
      parsedUrl.search = '';

      const host = parsedUrl.host.toLowerCase().replace(/^www\./, '');

      return `${parsedUrl.protocol.toLowerCase()}//${host}${parsedUrl.pathname
        .replace(/\/+$/, '')
        .toLowerCase()}`;
    } catch {
      return trimmedUrl.replace(/\/+$/, '').toLowerCase();
    }
  }
}
