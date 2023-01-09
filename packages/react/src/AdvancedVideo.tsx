import React, { Component, createRef, EventHandler, HTMLAttributes, MutableRefObject, SyntheticEvent } from 'react';
import { CloudinaryImage, CloudinaryVideo } from '@cloudinary/url-gen';

import {
  HtmlVideoLayer,
  Plugins,
  VideoSources,
  cancelCurrentlyRunningPlugins
} from '@cloudinary/html';

type ReactEventHandler<T = Element> = EventHandler<SyntheticEvent<T>>;

interface VideoProps extends HTMLAttributes<HTMLVideoElement>{
  cldVid: CloudinaryVideo,
  cldPoster?: CloudinaryImage | "auto",
  plugins?: Plugins,
  sources?: VideoSources,
  innerRef?: ((instance: any) => void) | MutableRefObject<unknown> | null

  // supported video attributes
  controls?: boolean
  loop?: boolean,
  muted?: boolean,
  poster?: string,
  preload?: string,
  autoPlay?: boolean,
  playsInline?: boolean

  // supported video events
  onPlay?: ReactEventHandler<any>,
  onLoadStart?: ReactEventHandler<any>,
  onPlaying?: ReactEventHandler<any>,
  onError?: ReactEventHandler<any>,
  onEnded?: ReactEventHandler<any>
}

const VIDEO_ATTRIBUTES_KEYS: string[] = ['controls', 'loop', 'muted', 'poster', 'preload', 'autoplay', 'playsinline'];

/**
 * @memberOf ReactSDK
 * @type {Component}
 * @description The Cloudinary video component.
 * @prop {CloudinaryVideo} transformation Generated by @cloudinary/url-gen
 * @prop {Plugins} plugins Advanced image component plugins lazyload()
 * @prop videoAttributes Optional attributes include controls, loop, muted, poster, preload, autoplay
 * @prop videoEvents Optional video events include play, loadstart, playing, error, ended
 * @prop {VideoSources} sources Optional sources to generate
 * @example
 *  <caption>
 *  Using custom defined resources.
 * </caption>
 * const vid = new CloudinaryVideo('dog', {cloudName: 'demo'});
 * const videoEl = useRef();
 * const sources = [
 *  {
 *    type: 'mp4',
 *    codecs: ['vp8', 'vorbis'],
 *    transcode: videoCodec(auto())
 *  },
 *  {
 *    type: 'webm',
 *    codecs: ['avc1.4D401E', 'mp4a.40.2'],
 *    videoCodec: videoCodec(auto())
 *  }];
 *
 * return <AdvancedVideo cldVid={vid} sources={sources} ref={videoEl} controls />
 */
class AdvancedVideo extends Component <VideoProps> {
  videoRef: MutableRefObject<HTMLVideoElement | null>
  htmlVideoLayerInstance: HtmlVideoLayer;

  constructor(props: VideoProps) {
    super(props);
    this.videoRef = createRef();
    this.attachRef = this.attachRef.bind(this);
  }

  /**
   * On mount, creates a new HTMLVideoLayer instance and initializes with ref to video element,
   * user generated cloudinaryVideo and the plugins to be used.
   */
  componentDidMount() {
    this.htmlVideoLayerInstance = new HtmlVideoLayer(
      this.videoRef && this.videoRef.current,
      this.props.cldVid,
      this.props.sources,
      this.props.plugins,
      this.getVideoAttributes()
    )
  }

  /**
   * On update, we cancel running plugins and update the video instance if the src
   * was changed.
   */
  componentDidUpdate() {
    cancelCurrentlyRunningPlugins(this.htmlVideoLayerInstance.htmlPluginState);
    // call html layer to update the dom again with plugins and reset toBeCanceled
    this.htmlVideoLayerInstance.update(this.props.cldVid, this.props.sources, this.props.plugins, this.getVideoAttributes())
  }

  /**
   * On unmount, we cancel the currently running plugins.
   */
  componentWillUnmount() {
    // safely cancel running events on unmount
    cancelCurrentlyRunningPlugins(this.htmlVideoLayerInstance.htmlPluginState)
  }

  /**
   * Returns video attributes.
   */
  getVideoAttributes() {
    const result = {};
    VIDEO_ATTRIBUTES_KEYS.forEach((key: string) => {
      if (key in this.props) {
        result[key] = this.props[key];
      }
    })
    if (this.props.cldPoster === 'auto') {
      result['poster'] = this.props.cldVid.quality("auto").format("jpg").toURL();
    } else if (this.props.cldPoster instanceof CloudinaryImage) {
      result['poster'] = this.props.cldPoster.toURL();
    }

    return result;
  }

  /**
   * Attach both this.videoRef and props.innerRef as ref to the given element.
   * @param element - the element to attach a ref to
   */
  attachRef(element: HTMLVideoElement) {
    this.videoRef.current = element;
    const { innerRef } = this.props;

    if (innerRef) {
      if (innerRef instanceof Function) {
        innerRef(element);
      } else {
        innerRef.current = element;
      }
    }
  };

  render() {
    const {
      cldVid,
      cldPoster,
      plugins,
      sources,
      innerRef,
      ...videoAttrs // Assume any other props are for the base element
    } = this.props;

    return <video {...videoAttrs} ref={this.attachRef} />
  }
}

export { AdvancedVideo };
