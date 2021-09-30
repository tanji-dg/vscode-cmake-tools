import { CMakeCache } from "@cmt/cache";

export type TargetTypeString
    = ('STATIC_LIBRARY'|'MODULE_LIBRARY'|'SHARED_LIBRARY'|'OBJECT_LIBRARY'|'EXECUTABLE'|'UTILITY'|'INTERFACE_LIBRARY');

/** Describes a cmake target */
export interface CodeModelTarget {
  /**
   * A string specifying the logical name of the target.
   *
   * (Source CMake Documentation cmake-file-api(7))
   */
  readonly name: string;

  /**
   * A string specifying the type of the target.
   * The value is one of EXECUTABLE, STATIC_LIBRARY, SHARED_LIBRARY, MODULE_LIBRARY, OBJECT_LIBRARY, or UTILITY.
   *
   * (Source CMake Documentation cmake-file-api(7))
   *
   * \todo clarify need of INTERFACE_LIBRARY type
   */
  type: TargetTypeString;

  /** A string specifying the absolute path to the target’s source directory. */
  sourceDirectory?: string;

  /** Name of the target artifact on disk (library or executable file name). */
  fullName?: string;

  /** List of absolute paths to a target´s build artifacts. */
  artifacts?: string[];

  /**
   * The file groups describe a list of compilation information for artifacts of this target.
   * The file groups contains source code files that use the same compilation information
   * and are known by CMake.
   */
  fileGroups?: CodeModelFileGroup[];

  /**
   * Represents the CMAKE_SYSROOT variable
   */
  sysroot?: string;
}

/**
 * Describes a file group to describe the build settings.
 */
export interface CodeModelFileGroup {
  /** List of source files with the same compilation information */
  sources: string[];

  /** Specifies the language (C, C++, ...) for the toolchain */
  language?: string;

  /** Include paths for compilation of a source file */
  includePath?: {
    /** include path */
    path: string;
  }[];

  /** Compiler flags */
  compileFlags?: string;

  /** Defines */
  defines?: string[];

  /** CMake generated file group */
  isGenerated: boolean;
}

/**
 * Describes cmake project and all its related targets
 */
export interface CodeModelProject {
  /** Name of the project */
  name: string;

  /** List of targets */
  targets: CodeModelTarget[];

  /** Location of the Project */
  sourceDirectory: string;
}

/**
 * Describes cmake configuration
 */
export interface CodeModelConfiguration {
  /** List of project() from CMakeLists.txt */
  projects: CodeModelProject[];

  /** Name of the active configuration in a multi-configuration generator.*/
  name: string;
}

export interface CodeModelToolchain {
  path: string;
  target?: string;
}

/** Describes the cmake model */
export interface CodeModelContent {
  /** List of configurations provided by the selected generator */
  configurations: CodeModelConfiguration[];

  toolchains: Map<string, CodeModelToolchain>;
}

/**
 * Type given when updating the configuration data stored in the file index.
 */
 export interface CodeModelParams {
  /**
   * The CMake codemodel content. This is the important one.
   */
  codeModelContent: CodeModelContent;
  /**
   * The contents of the CMakeCache.txt, which also provides supplementary
   * configuration information.
   */
  cache: CMakeCache;
  /**
   * The path to `cl.exe`, if necessary. VS generators will need this property
   * because the compiler path is not available via the `kit` nor `cache`
   * property.
   */
  clCompilerPath?: string|null;
  /**
   * The active target
   */
  activeTarget: string|null;
  /**
   * CMAKE_BUILD_TYPE for single config generators, and build config for multi config ones.
   */
  activeBuildTypeVariant: string|null;
  /**
   * Workspace folder full path.
   */
  folder: string;
}
