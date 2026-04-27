import { BadRequestException, Injectable } from '@nestjs/common';

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
  source?: 'facebook' | 'instagram';
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
  source?: 'facebook' | 'instagram';
};

const INVALID_SOCIAL_PRODUCT_URL_MESSAGE =
  'Please paste a Facebook or Instagram product/post link.';

const INVALID_SOCIAL_STORE_URL_MESSAGE =
  'Please paste a Facebook or Instagram business/page link.';

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
    const normalizedUrl = this.normalizeUrl(url);
    const store = this.storeLookup.get(normalizedUrl);

    if (!store) {
      return this.createDummyStore(url);
    }

    return store;
  }

  findProduct(url: string): DemoSocialProduct {
    const normalizedUrl = this.normalizeUrl(url);
    const product = this.productLookup.get(normalizedUrl);

    if (!product) {
      return this.createDummyProduct(url);
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
      const parsedUrl = new URL(this.withProtocol(trimmedUrl));
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

  private createDummyProduct(url: string): DemoSocialProduct {
    const parsedUrl = this.parseSocialUrl(url);

    if (!parsedUrl) {
      throw new BadRequestException(INVALID_SOCIAL_PRODUCT_URL_MESSAGE);
    }

    const platformName =
      parsedUrl.source === 'instagram' ? 'Instagram' : 'Facebook';
    const readableSlug = this.toReadableName(parsedUrl.slug);

    return {
      name: readableSlug || `${platformName} Demo Product`,
      description: `Imported demo product from a ${platformName} link. Review and edit this information before publishing.`,
      image: '/demo-social/products/New-Balance-9060.jpg',
      price: parsedUrl.source === 'instagram' ? 1499 : 1999,
      stock: 10,
      category:
        parsedUrl.source === 'instagram' ? 'Instagram Finds' : 'Facebook Finds',
      caption: `${readableSlug || `${platformName} Demo Product`} - demo import created from ${platformName}.`,
      socialLink: url.trim(),
      source: parsedUrl.source,
    };
  }

  private createDummyStore(url: string): DemoSocialStore {
    const parsedUrl = this.parseSocialUrl(url);

    if (!parsedUrl) {
      throw new BadRequestException(INVALID_SOCIAL_STORE_URL_MESSAGE);
    }

    const platformName =
      parsedUrl.source === 'instagram' ? 'Instagram' : 'Facebook';
    const readableSlug = this.toReadableName(parsedUrl.slug);
    const storeName = readableSlug || `${platformName} Demo Store`;

    return {
      name: storeName,
      description: `Imported demo store profile from a ${platformName} link. Review the branding, contact details, and category before saving.`,
      logo: '/demo-social/stores/demozapshoe-logo.png',
      banner: '/demo-social/stores/demozapshoe-banner.png',
      category:
        parsedUrl.source === 'instagram'
          ? 'Instagram Seller'
          : 'Facebook Seller',
      phone: '+8801700000000',
      email: `${this.toEmailLocalPart(storeName)}@shoplinker.demo`,
      address: 'Dhaka, Bangladesh',
      socialLink: url.trim(),
      source: parsedUrl.source,
    };
  }

  private parseSocialUrl(
    url: string,
  ): { source: 'facebook' | 'instagram'; slug: string } | null {
    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      return null;
    }

    try {
      const parsedUrl = new URL(this.withProtocol(trimmedUrl));
      const host = parsedUrl.host.toLowerCase().replace(/^www\./, '');
      const pathParts = parsedUrl.pathname
        .split('/')
        .map((part) => part.trim())
        .filter(Boolean);

      if (
        host === 'facebook.com' ||
        host === 'fb.com' ||
        host === 'm.facebook.com'
      ) {
        return {
          source: 'facebook',
          slug: pathParts.at(-1) || 'facebook-demo-product',
        };
      }

      if (host === 'instagram.com') {
        return {
          source: 'instagram',
          slug: pathParts.at(-1) || 'instagram-demo-product',
        };
      }
    } catch {
      return null;
    }

    return null;
  }

  private toReadableName(slug = ''): string {
    return slug
      .replace(/[-_]+/g, ' ')
      .replace(/[^\w\s]/g, '')
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  private withProtocol(url: string): string {
    return /^https?:\/\//i.test(url) ? url : `https://${url}`;
  }

  private toEmailLocalPart(value: string): string {
    return (
      value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '.')
        .replace(/^\.+|\.+$/g, '') || 'demo.store'
    );
  }
}
